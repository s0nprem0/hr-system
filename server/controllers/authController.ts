import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../logger';
import { sendSuccess, sendError } from '../utils/apiResponse';

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return sendError(res, 'Invalid credentials', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 'Invalid credentials', 401);
        }

        const jwtKey = process.env.JWT_KEY;
        if (!jwtKey) {
            // Use logger if available; require dynamically to avoid circular import errors
            const { default: logger } = await import('../logger');
            logger.error('JWT_KEY is not set in environment');
            return sendError(res, 'Server misconfiguration', 500);
        }

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            jwtKey,
            { expiresIn: "10d" }
        );

        return sendSuccess(res, { token, user: { _id: user._id, name: user.name, role: user.role } }, 200);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ err: error }, 'Login error');
        return sendError(res, message, 500);
    }
};

const verify = (req: Request, res: Response) => {
    return sendSuccess(res, { user: req.user }, 200);
}

const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return sendError(res, 'Email already in use', 409);
        }

        const hashed = await bcrypt.hash(password, 10);
        const created = await User.create({ name, email, password: hashed, role: 'employee' });

        return sendSuccess(res, { user: { _id: created._id, name: created.name, role: created.role } }, 201);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error({ err }, 'Register error');
        return sendError(res, message, 500);
    }
}

export { login, register, verify };
