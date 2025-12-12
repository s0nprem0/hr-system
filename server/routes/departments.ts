import express from 'express';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';
import { body, param } from 'express-validator';
import departmentsController from '../controllers/departmentsController';

const router = express.Router();

router.get('/', verifyUser, authorize(['admin', 'hr']), departmentsController.listDepartments);

router.post(
  '/',
  verifyUser,
  authorize(['admin']),
  [body('name').trim().notEmpty().withMessage('Name is required')],
  departmentsController.createDepartment,
);

router.get('/:id', verifyUser, authorize(['admin', 'hr']), [param('id').isMongoId().withMessage('Invalid id')], departmentsController.getDepartment);

router.put('/:id', verifyUser, authorize(['admin']), [param('id').isMongoId().withMessage('Invalid id'), body('name').optional().trim()], departmentsController.updateDepartment);

router.delete('/:id', verifyUser, authorize(['admin']), [param('id').isMongoId().withMessage('Invalid id')], departmentsController.deleteDepartment);

export default router;
