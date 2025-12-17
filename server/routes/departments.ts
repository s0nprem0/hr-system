import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import requirePermission from '../middleware/requirePermission';
import { body, param } from 'express-validator';
import validationHandler from '../middleware/validationHandler';
import departmentsController from '../controllers/departmentsController';

const router = express.Router();

router.get('/', verifyUser, requirePermission('manageDepartments'), departmentsController.listDepartments);

router.post(
  '/',
  verifyUser,
  requirePermission('manageDepartments'),
  [body('name').trim().notEmpty().withMessage('Name is required')],
  validationHandler,
  departmentsController.createDepartment,
);

router.get(
  '/:id',
  verifyUser,
  requirePermission('manageDepartments'),
  [param('id').isMongoId().withMessage('Invalid id')],
  validationHandler,
  departmentsController.getDepartment,
);

router.put(
  '/:id',
  verifyUser,
  requirePermission('manageDepartments'),
  [param('id').isMongoId().withMessage('Invalid id'), body('name').optional().trim()],
  validationHandler,
  departmentsController.updateDepartment,
);

router.delete(
  '/:id',
  verifyUser,
  requirePermission('manageDepartments'),
  [param('id').isMongoId().withMessage('Invalid id')],
  validationHandler,
  departmentsController.deleteDepartment,
);

export default router;
