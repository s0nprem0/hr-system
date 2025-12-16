import express from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { login, verify, register, refresh, logout } from '../controllers/authController';
import verifyUser from '../middleware/authMiddleware';
import authorize from '../middleware/authorize';
import loginRateLimiter from '../middleware/rateLimit';
import { body } from 'express-validator';
import validationHandler from '../middleware/validationHandler';

const router = express.Router();

// Registration route with validation
router.post(
	'/register',
	[
		body('name').trim().notEmpty().withMessage('Name is required'),
		body('email').isEmail().withMessage('Valid email required'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	],
	validationHandler,
	register,
);

router.post(
	'/login',
	[
		body('email').isEmail().withMessage('Valid email required'),
		body('password').notEmpty().withMessage('Password is required'),
	],
	loginRateLimiter,
	validationHandler,
	login,
);
router.get('/verify', verifyUser, verify);

router.post('/refresh', validationHandler, refresh);
router.post('/logout', validationHandler, logout);

// Sample protected admin route (returns basic info if user is admin)
router.get('/admin', verifyUser, authorize(['admin']), (req, res) => {
	return sendSuccess(res, { message: 'Admin access granted', user: req.user }, 200);
});

export default router;
