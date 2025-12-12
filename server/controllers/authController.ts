import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const jwtKey = process.env.JWT_KEY;
        if (!jwtKey) {
            console.error('JWT_KEY is not set in environment');
            return res.status(500).json({ success: false, error: 'Server misconfiguration' });
        }

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            jwtKey,
            { expiresIn: "10d" }
        );

        return res.status(200).json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, role: user.role }
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

const verify = (req: Request, res: Response) => {
    return res.status(200).json({ success: true, user: req.user });
}

const register = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, error: 'Email already in use' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const created = await User.create({ name, email, password: hashed, role: 'employee' });

        return res.status(201).json({
            success: true,
            user: { _id: created._id, name: created.name, role: created.role },
        });
    } catch (err: any) {
        console.error('Register error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
}

export { login, register, verify };
