import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'hr' | 'employee';
  profile: {
    department?: mongoose.Types.ObjectId;
    designation?: string;
    salary?: number;
  };
  createdAt: Date;
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'hr', 'employee'],
    default: 'employee'
  },
  profile: {
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    designation: String,
    salary: Number,
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', userSchema);
