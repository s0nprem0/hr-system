import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import requirePermission from '../middleware/requirePermission';
import validationHandler from '../middleware/validationHandler';
import { param, body } from 'express-validator';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import { sendSuccess, sendError } from '../utils/apiResponse';
import logger from '../logger';
import safeAuditLog from '../utils/auditLogger';

const router = express.Router();

// List users - accessible to admin and hr
router.get('/', verifyUser, requirePermission('manageUsers'), async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;

    const filter: Record<string, unknown> = {};
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
  requirePermission('manageUsers'),
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

// Get single user - admin and hr can view
router.get('/:id', verifyUser, requirePermission('manageUsers'), [param('id').isMongoId().withMessage('Invalid id')], validationHandler, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info({ id }, 'GET /api/users/:id requested');
    const user = await User.findById(id).select('-password').lean();
    logger.info({ found: !!user, id }, 'GET /api/users/:id lookup result');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, user);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return sendError(res, msg, 500);
  }
});

// Create user (admin)
router.post(
  '/',
  verifyUser,
  requirePermission('manageUsers'),
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

      // audit log (non-blocking)
      await safeAuditLog({
        collectionName: 'User',
        documentId: created._id,
        action: 'create',
        user: req.user?._id,
        before: null,
        after: result,
      });

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
  requirePermission('manageUsers'),
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
      // Use a typed copy so we can safely check and hash the password
      const safeUpdates = { ...(updates as Partial<Record<string, unknown>>) } as Partial<Record<string, unknown>>;
      if (typeof safeUpdates.password === 'string' && safeUpdates.password.length > 0) {
        const bcrypt = await import('bcryptjs');
        safeUpdates.password = await bcrypt.hash(safeUpdates.password, 10);
      }

      const before = await User.findById(id).lean();
      const updated = await User.findByIdAndUpdate(id, safeUpdates, { new: true }).select('-password');
      if (!updated) return sendError(res, 'User not found', 404);

      await safeAuditLog({
        collectionName: 'User',
        documentId: id,
        action: 'update',
        user: req.user?._id,
        before,
        after: updated,
      });

      return sendSuccess(res, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return sendError(res, msg, 500);
    }
  },
);

export default router;
