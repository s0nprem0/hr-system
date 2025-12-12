import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';
import validationHandler from '../middleware/validationHandler';
import { param, body } from 'express-validator';
import type { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { sendSuccess, sendError } from '../utils/apiResponse';
import AuditLog from '../models/AuditLog';
import logger from '../logger';

const router = express.Router();

// List users - accessible to admin and hr
router.get('/', verifyUser, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, { items: users, total, page, limit });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return sendError(res, msg, 500);
  }
});

// Delete user - admin only
router.delete(
  '/:id',
  verifyUser,
  authorize(['admin']),
  [param('id').isMongoId().withMessage('Invalid id')],
  validationHandler,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await User.findByIdAndDelete(id).select('-password').lean();
      if (!deleted) return sendError(res, 'User not found', 404);
      return sendSuccess(res, { user: deleted });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return sendError(res, msg, 500);
    }
  },
);

// Create user (admin)
router.post(
  '/',
  verifyUser,
  authorize(['admin']),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'hr', 'employee']).withMessage('Invalid role'),
  ],
  validationHandler,
  async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body as { name: string; email: string; password: string; role?: string };
      const existing = await User.findOne({ email });
      if (existing) return sendError(res, 'Email already in use', 409);
      const bcrypt = await import('bcryptjs');
      const hashed = await bcrypt.hash(password, 10);
      const created = await User.create({ name, email, password: hashed, role: role || 'employee' });
      const result = await User.findById(created._id).select('-password');

      // audit log
      try {
        await AuditLog.create({
          collectionName: 'User',
          documentId: created._id,
          action: 'create',
          user: req.user?._id,
          before: null,
          after: result,
        });
      } catch (auditErr) {
        logger.warn({ auditErr }, 'Failed to write user audit log (create)');
      }

      return sendSuccess(res, result, 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return sendError(res, msg, 500);
    }
  },
);

// Update user (admin)
router.put(
  '/:id',
  verifyUser,
  authorize(['admin']),
  [
    param('id').isMongoId().withMessage('Invalid id'),
    body('name').optional().trim(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'hr', 'employee']),
  ],
  validationHandler,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates: Partial<Record<string, unknown>> = { ...req.body };
      if (updates.password) {
        const bcrypt = await import('bcryptjs');
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const before = await User.findById(id).lean();
      const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
      if (!updated) return sendError(res, 'User not found', 404);

      try {
        await AuditLog.create({
          collectionName: 'User',
          documentId: id,
          action: 'update',
          user: req.user?._id,
          before,
          after: updated,
        });
      } catch (auditErr) {
        logger.warn({ auditErr }, 'Failed to write user audit log (update)');
      }

      return sendSuccess(res, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return sendError(res, msg, 500);
    }
  },
);

export default router;
