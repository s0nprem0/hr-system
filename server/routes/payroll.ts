import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';

const router = express.Router();

// List payroll entries - hr and admin
router.get('/', verifyUser, authorize(['admin', 'hr']), async (req, res) => {
  return res.json({ success: true, data: [], message: 'Payroll list (placeholder)' });
});

// Create payroll entry - hr only
router.post('/', verifyUser, authorize(['hr']), async (req, res) => {
  // TODO: create payroll entry
  return res.status(201).json({ success: true, message: 'Payroll entry created (placeholder)' });
});

export default router;
