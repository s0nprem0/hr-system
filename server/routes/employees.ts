import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';

const router = express.Router();

// Get current user's profile - authenticated users
router.get('/me', verifyUser, async (req, res) => {
  return res.json({ success: true, user: req.user });
});

// Get employee by id - admin and hr
router.get('/:id', verifyUser, authorize(['admin', 'hr']), async (req, res) => {
  const { id } = req.params;
  // TODO: fetch employee
  return res.json({ success: true, data: { id }, message: 'Employee detail (placeholder)' });
});

export default router;
