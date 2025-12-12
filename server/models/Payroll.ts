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

export default mongoose.model<IPayroll>('Payroll', payrollSchema);
