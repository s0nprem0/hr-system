import type { Request, Response } from 'express';
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

export { login, verify };
