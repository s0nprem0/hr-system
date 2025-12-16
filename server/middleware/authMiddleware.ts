import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import type { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import logger from '../logger';
import { sendError } from '../utils/apiResponse';

// 1. Extend the Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayloadWithId extends JwtPayload {
  _id?: string;
}

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    if (!token) {
      return sendError(res, 'Token not provided', 401);
    }

    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      const { default: logger } = await import('../logger');
      logger.error('JWT_KEY is not set in environment');
      return sendError(res, 'Server misconfiguration', 500);
    }

    let decodedWithId: JwtPayloadWithId;
    try {
      decodedWithId = jwt.verify(token, jwtKey) as JwtPayloadWithId;
    } catch (err) {
      return sendError(res, 'Token not valid', 401);
    }

    const user = await User.findById(decodedWithId._id).select("-password");
    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    req.user = user;
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, `verifyUser error: ${message}`);
    return sendError(res, 'Server Error', 500);
  }
};

export default verifyUser;
