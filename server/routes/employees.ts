import express from 'express';
import { param, body, query } from 'express-validator';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';
import validationHandler from '../middleware/validationHandler';
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeesController';

const router = express.Router();

// Get current user's profile - authenticated users
router.get('/me', verifyUser, async (req, res) => {
  return res.json({ success: true, user: req.user });
});

// List employees - admin and hr
router.get(
  '/',
  verifyUser,
  authorize(['admin', 'hr']),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
  validationHandler,
  listEmployees
);

// Get employee by id - admin and hr
router.get(
  '/:id',
  verifyUser,
  authorize(['admin', 'hr']),
  param('id').isMongoId().withMessage('Invalid employee id'),
  validationHandler,
  getEmployee
);

// Create employee - admin/hr
router.post(
  '/',
  verifyUser,
  authorize(['admin', 'hr']),
  body('name').isString().notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'hr', 'employee']).withMessage('invalid role'),
  validationHandler,
  createEmployee
);

// Update employee - admin/hr
router.put(
  '/:id',
  verifyUser,
  authorize(['admin', 'hr']),
  param('id').isMongoId().withMessage('Invalid employee id'),
  body('name').optional().isString(),
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'hr', 'employee']),
  validationHandler,
  updateEmployee
);

// Delete employee - admin only
router.delete(
  '/:id',
  verifyUser,
  authorize(['admin']),
  param('id').isMongoId().withMessage('Invalid employee id'),
  validationHandler,
  deleteEmployee
);

export default router;
