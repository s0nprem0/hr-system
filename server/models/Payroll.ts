import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  employee: mongoose.Types.ObjectId;
  amount: number;
  payDate: Date;
  createdAt: Date;
}

const payrollSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  payDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Indexes to improve query performance for common lookups
payrollSchema.index({ employee: 1 });
payrollSchema.index({ payDate: 1 });

export default mongoose.model<IPayroll>('Payroll', payrollSchema);
