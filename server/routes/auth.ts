import express from 'express';
import { login, verify } from '../controllers/authController';
import verifyUser from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verifyUser, verify);

export default router;
