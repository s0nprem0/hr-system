import mongoose, { Schema, Document } from 'mongoose'

export interface IEmployeeDraft extends Document {
	user: mongoose.Types.ObjectId
	data: Record<string, unknown>
	updatedAt: Date
}

const EmployeeDraftSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		data: { type: Schema.Types.Mixed, default: {} },
	},
	{ timestamps: true }
)

export default mongoose.model<IEmployeeDraft>(
	'EmployeeDraft',
	EmployeeDraftSchema
)
