import express from 'express';
import { query } from 'express-validator';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';
import validationHandler from '../middleware/validationHandler';
import { listAuditLogs } from '../controllers/auditController';

const router = express.Router();

// List audit logs - admin and hr
router.get(
  '/',
  verifyUser,
  authorize(['admin', 'hr']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  validationHandler,
  listAuditLogs,
);

export default router;
