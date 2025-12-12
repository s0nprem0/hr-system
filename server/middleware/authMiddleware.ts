import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import type { Request, Response, NextFunction } from "express";
import User from "../models/User";

// 1. Extend the Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any; // Or IUser if you’ve got that interface
    }
  }
}

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(404).json({ success: false, error: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
    if (!decoded) {
      return res.status(404).json({ success: false, error: "Token not valid" });
    }

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

export default verifyUser;
