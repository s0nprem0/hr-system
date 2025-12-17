import express from 'express';
import { query, param } from 'express-validator';
import verifyUser from '../middleware/authMiddleware';
import requirePermission from '../middleware/requirePermission';
import validationHandler from '../middleware/validationHandler';
import { listAuditLogs } from '../controllers/auditController';
import { getAuditLog } from '../controllers/auditController';

const router = express.Router();

// List audit logs - admin and hr
router.get(
  '/',
  verifyUser,
  requirePermission('viewAuditLogs'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  validationHandler,
  listAuditLogs,
);

// Get single audit entry
router.get(
  '/:id',
  verifyUser,
  requirePermission('viewAuditLogs'),
  param('id').isMongoId().withMessage('Invalid id'),
  validationHandler,
  getAuditLog,
);

export default router;

