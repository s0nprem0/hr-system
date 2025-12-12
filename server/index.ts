import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/auth';

// Load environment variables from .env if present
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Connect to MongoDB (safe: avoid passing undefined to mongoose.connect)
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/hr-system';
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set — falling back to local MongoDB:', mongoUri);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('DB Connection Error:', err);
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
