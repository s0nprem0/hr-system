import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';

const router = express.Router();

// List users - accessible to admin and hr
router.get('/', verifyUser, authorize(['admin', 'hr']), async (req, res) => {
  // TODO: implement fetching users from DB
  return res.json({ success: true, data: [], message: 'List users (placeholder)' });
});

// Delete user - admin only
router.delete('/:id', verifyUser, authorize(['admin']), async (req, res) => {
  // TODO: implement user deletion
  const { id } = req.params;
  return res.json({ success: true, message: `User ${id} deleted (placeholder)` });
});

export default router;
