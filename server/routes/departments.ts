import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';

const router = express.Router();

// List departments - admin and hr
router.get('/', verifyUser, authorize(['admin', 'hr']), async (req, res) => {
  return res.json({ success: true, data: [], message: 'Departments list (placeholder)' });
});

// Create department - admin only
router.post('/', verifyUser, authorize(['admin']), async (req, res) => {
  // TODO: create department
  return res.status(201).json({ success: true, message: 'Department created (placeholder)' });
});

export default router;
