import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hr-system');
        logger.info('MongoDB connected (seed)');
    } catch (err) {
        logger.error({ err }, 'DB Connection Error (seed)');
    }
};

const userRegister = async () => {
    await connectDB();
        try {
                // Admin (can be overridden by env vars for CI/dev)
                    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
                    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
                const adminExists = await User.findOne({ email: adminEmail });
                if (!adminExists) {
                    const adminHash = await bcrypt.hash(adminPassword, 10);
                    await User.create({ name: 'Admin User', email: adminEmail, password: adminHash, role: 'admin' });
                    logger.info('✅ Admin user created');
                } else {
                    logger.info('ℹ️ Admin user already exists, skipping');
                }

                // HR (can be overridden by env vars)
                const hrEmail = process.env.HR_EMAIL || 'hr@gmail.com';
                const hrPassword = process.env.HR_PASSWORD || 'hr12345';
                const hrExists = await User.findOne({ email: hrEmail });
                if (!hrExists) {
                    const hrHash = await bcrypt.hash(hrPassword, 10);
                    await User.create({ name: 'HR User', email: hrEmail, password: hrHash, role: 'hr' });
                    logger.info('✅ HR user created');
                } else {
                    logger.info('ℹ️ HR user already exists, skipping');
                }

                // Employee (can be overridden by env vars)
                const empEmail = process.env.EMP_EMAIL || 'employee@gmail.com';
                const empPassword = process.env.EMP_PASSWORD || 'mrham';
                const empExists = await User.findOne({ email: empEmail });
                if (!empExists) {
                    const empHash = await bcrypt.hash(empPassword, 10);
                    await User.create({ name: 'Mr. Ham', email: empEmail, password: empHash, role: 'employee' });
                    logger.info('✅ Employee user created');
                } else {
                    logger.info('ℹ️ Employee user already exists, skipping');
                }

    } catch (error) {
        logger.error({ error }, 'Error seeding users (might already exist)');
    } finally {
        await mongoose.disconnect(); // Close connection when done
    }
};

userRegister();
