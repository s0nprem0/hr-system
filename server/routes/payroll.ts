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
router.post(
  '/',
  verifyUser,
  requirePermission('managePayroll'),
  body('employeeId').isMongoId().withMessage('employeeId must be a valid id'),
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
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
