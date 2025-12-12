import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../logger';
import { sendSuccess, sendError } from '../utils/apiResponse';
import RefreshToken from '../models/RefreshToken';
import crypto from 'crypto';

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

        const token = (jwt.sign as any)(
            { _id: user._id, role: user.role },
            jwtKey,
            { expiresIn: process.env.JWT_EXPIRES || '1h' }
        );

        // create a refresh token and persist it
        const refreshTokenValue = crypto.randomBytes(48).toString('hex');
        const refreshTtlSeconds = Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7); // default 7 days
        const refresh = await RefreshToken.create({
            token: refreshTokenValue,
            user: user._id,
            expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
        });

        return sendSuccess(
            res,
            { token, refreshToken: refresh.token, user: { _id: user._id, name: user.name, role: user.role } },
            200,
        );

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

// exported at bottom together with refresh/logout

const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return sendError(res, 'Refresh token required', 400);

        const found = await RefreshToken.findOne({ token: refreshToken });
        if (!found || found.revoked) return sendError(res, 'Refresh token invalid', 401);
        if (found.expiresAt < new Date()) return sendError(res, 'Refresh token expired', 401);

        const user = await User.findById(found.user);
        if (!user) return sendError(res, 'User not found', 404);

        const jwtKey = process.env.JWT_KEY;
        if (!jwtKey) return sendError(res, 'Server misconfiguration', 500);

            const token = (jwt.sign as any)( { _id: user._id, role: user.role }, jwtKey, { expiresIn: process.env.JWT_EXPIRES || '1h' });

            // Rotate refresh token: revoke old one and issue a new refresh token
            const newRefreshValue = crypto.randomBytes(48).toString('hex');
            const refreshTtlSeconds = Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7);
            // mark old token revoked
            found.revoked = true;
            await found.save();

            const newRefresh = await RefreshToken.create({
                token: newRefreshValue,
                user: user._id,
                expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
            });

            return sendSuccess(res, { token, refreshToken: newRefresh.token }, 200);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error({ err }, 'refresh token error');
        return sendError(res, message, 500);
    }
};

const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return sendError(res, 'Refresh token required', 400);
        const found = await RefreshToken.findOne({ token: refreshToken });
        if (found) {
            found.revoked = true;
            await found.save();
        }
        return sendSuccess(res, { revoked: !!found }, 200);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error({ err }, 'logout error');
        return sendError(res, message, 500);
    }
};

export { login, register, verify, refresh, logout };
