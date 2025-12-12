import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Connect to MongoDB
const connectDB = async () => {
    try {
        // Process
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('MongoDB connected');
    } catch (err) {
        console.error("DB Connection Error:",err);
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
