import express from 'express';
import { body, query, param } from 'express-validator';
import verifyUser from '../middleware/authMiddleware';
import requirePermission from '../middleware/requirePermission';
import validationHandler from '../middleware/validationHandler';
import {
  listPayroll,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from '../controllers/payrollController';

const router = express.Router();

// List payroll entries - hr and admin
router.get(
  '/',
  verifyUser,
  requirePermission('managePayroll'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
  validationHandler,
  listPayroll
);

// Create payroll entry - hr only
// Create payroll entry - hr only
router.post(
  '/',
  verifyUser,
  requirePermission('managePayroll'),
  body('employeeId').isMongoId().withMessage('employeeId must be a valid id'),
  // require either `gross` or legacy `amount` and validate it's a positive number (accept numeric strings)
  body().custom((v, { req }) => {
    const val = req.body.gross ?? req.body.amount;
    if (val === undefined || val === null) throw new Error('gross or amount is required');
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) throw new Error('gross or amount must be a positive number');
    return true;
  }),
  body('payDate').optional().isISO8601().withMessage('payDate must be a valid date'),
  validationHandler,
  createPayroll
);

// Get payroll entry
router.get(
  '/:id',
  verifyUser,
  requirePermission('managePayroll'),
  param('id').isMongoId().withMessage('Invalid payroll id'),
  validationHandler,
  getPayroll
);

// Update payroll entry
router.put(
  '/:id',
  verifyUser,
  requirePermission('managePayroll'),
  param('id').isMongoId().withMessage('Invalid payroll id'),
  body('employeeId').optional().isMongoId(),
  body('amount').optional().isFloat({ gt: 0 }),
  body('gross').optional().isFloat({ gt: 0 }),
  body('payDate').optional().isISO8601(),
  validationHandler,
  updatePayroll
);

// Delete payroll entry
router.delete(
  '/:id',
  verifyUser,
  requirePermission('managePayroll'),
  param('id').isMongoId().withMessage('Invalid payroll id'),
  validationHandler,
  deletePayroll
);

export default router;
