import express from 'express';
import { login, verify, register } from '../controllers/authController';
import verifyUser from '../middleware/authMiddleware';
import loginRateLimiter from '../middleware/rateLimit';
import { body } from 'express-validator';

const router = express.Router();

// Registration route with validation
router.post(
	'/register',
	[
		body('name').trim().notEmpty().withMessage('Name is required'),
		body('email').isEmail().withMessage('Valid email required'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	],
	register,
);

router.post(
	'/login',
	[
		body('email').isEmail().withMessage('Valid email required'),
		body('password').notEmpty().withMessage('Password is required'),
	],
	loginRateLimiter,
	login,
);
router.get('/verify', verifyUser, verify);

export default router;
