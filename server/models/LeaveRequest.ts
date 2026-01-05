import mongoose, { Schema, Document } from 'mongoose'

export type LeaveType = 'vacation' | 'sick' | 'unpaid'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface ILeaveRequest extends Document {
	user: mongoose.Types.ObjectId
	startDate: Date
	endDate: Date
	type: LeaveType
	status: LeaveStatus
	reason?: string
	approver?: mongoose.Types.ObjectId
	createdAt: Date
	updatedAt: Date
}

const leaveSchema = new Schema<ILeaveRequest>(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		startDate: { type: Date, required: true },
		endDate: { type: Date, required: true },
		type: {
			type: String,
			enum: ['vacation', 'sick', 'unpaid'],
			default: 'vacation',
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
		reason: { type: String },
		approver: { type: Schema.Types.ObjectId, ref: 'User' },
	},
	{ timestamps: true }
)

leaveSchema.index({ user: 1, status: 1 })

export default mongoose.model<ILeaveRequest>('LeaveRequest', leaveSchema)
