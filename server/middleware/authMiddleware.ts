import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import type { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";

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
      return res.status(401).json({ success: false, error: "Token not provided" });
    }

    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      const { default: logger } = await import('../logger');
      logger.error('JWT_KEY is not set in environment');
      return res.status(500).json({ success: false, error: 'Server misconfiguration' });
    }

    let decodedWithId: JwtPayloadWithId;
    try {
      decodedWithId = jwt.verify(token, jwtKey) as JwtPayloadWithId;
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Token not valid' });
    }

    const user = await User.findById(decodedWithId._id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

export default verifyUser;
