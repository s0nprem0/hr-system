import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/apiResponse';

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
router.delete('/:id', verifyUser, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id).select('-password').lean();
    if (!deleted) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user: deleted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return sendError(res, msg, 500);
  }
});

export default router;
