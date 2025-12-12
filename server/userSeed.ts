import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hr-system');
        console.log('MongoDB connected');
    } catch (err) {
        console.error('DB Connection Error:', err);
    }
};

const userRegister = async () => {
    await connectDB();
        try {
                // Admin
                const adminEmail = 'admin@gmail.com';
                const adminPassword = 'admin123';
                const adminExists = await User.findOne({ email: adminEmail });
                if (!adminExists) {
                    const adminHash = await bcrypt.hash(adminPassword, 10);
                    await User.create({ name: 'Admin User', email: adminEmail, password: adminHash, role: 'admin' });
                    console.log('✅ Admin user created');
                } else {
                    console.log('ℹ️ Admin user already exists, skipping');
                }

                // HR
                const hrEmail = 'hr@gmail.com';
                const hrPassword = 'hr12345'
                const hrExists = await User.findOne({ email: hrEmail });
                if (!hrExists) {
                    const hrHash = await bcrypt.hash(hrPassword, 10);
                    await User.create({ name: 'HR User', email: hrEmail, password: hrHash, role: 'hr' });
                    console.log('✅ HR user created');
                } else {
                    console.log('ℹ️ HR user already exists, skipping');
                }

                // Employee
                const empEmail = 'employee@gmail.com';
                const empPassword = 'mrham';
                const empExists = await User.findOne({ email: empEmail });
                if (!empExists) {
                    const empHash = await bcrypt.hash(empPassword, 10);
                    await User.create({ name: 'Mr. Ham', email: empEmail, password: empHash, role: 'employee' });
                    console.log('✅ Employee user created');
                } else {
                    console.log('ℹ️ Employee user already exists, skipping');
                }

    } catch (error) {
        console.log("Error seeding users (might already exist):", error);
    } finally {
        await mongoose.disconnect(); // Close connection when done
    }
};

userRegister();
