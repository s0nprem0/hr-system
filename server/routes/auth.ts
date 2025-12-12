import express from 'express';
import { login, verify } from '../controllers/authController';
import verifyUser from '../middleware/authMiddleware';
import loginRateLimiter from '../middleware/rateLimit';

const router = express.Router();

router.post('/login', loginRateLimiter, login);
router.get('/verify', verifyUser, verify);

export default router;
