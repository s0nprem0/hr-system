import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  employee: mongoose.Types.ObjectId;
  gross: number;
  net: number;
  tax?: number;
  periodStart: Date;
  periodEnd?: Date;
  payDate?: Date;
  createdAt: Date;
}

const payrollSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gross: { type: Number, required: true },
  net: { type: Number, required: true },
  tax: { type: Number },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date },
  payDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Indexes to improve query performance for common lookups
payrollSchema.index({ employee: 1 });
payrollSchema.index({ periodStart: 1 });
payrollSchema.index({ payDate: 1 });

export default mongoose.model<IPayroll>('Payroll', payrollSchema);
