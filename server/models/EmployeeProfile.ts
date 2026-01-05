import mongoose, { Schema, Document } from 'mongoose'

export interface IEmployeeProfile extends Document {
	user: mongoose.Types.ObjectId
	// Employment Details
	department?: mongoose.Types.ObjectId
	jobTitle?: string
	employmentType: 'full-time' | 'part-time' | 'contract' | 'intern'
	status: 'active' | 'on-leave' | 'terminated'
	dateOfJoining?: Date

	// Compensation (Source of Truth for Payroll)
	salary: number
	currency: string

	// Personal Details
	phone?: string
	address?: {
		street?: string
		city?: string
		state?: string
		zip?: string
		country?: string
	}
	emergencyContact?: {
		name?: string
		relation?: string
		phone?: string
	}

	createdAt: Date
	updatedAt: Date
}

const EmployeeProfileSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		department: { type: Schema.Types.ObjectId, ref: 'Department' },
		jobTitle: { type: String },
		employmentType: {
			type: String,
			enum: ['full-time', 'part-time', 'contract', 'intern'],
			default: 'full-time',
		},
		status: {
			type: String,
			enum: ['active', 'on-leave', 'terminated'],
			default: 'active',
		},
		dateOfJoining: { type: Date },

		salary: { type: Number, default: 0 },
		currency: { type: String, default: 'USD' },

		phone: { type: String },
		address: {
			street: String,
			city: String,
			state: String,
			zip: String,
			country: String,
		},
		emergencyContact: {
			name: String,
			relation: String,
			phone: String,
		},
	},
	{ timestamps: true }
)

// Index for frequent filters
EmployeeProfileSchema.index({ department: 1 })
EmployeeProfileSchema.index({ status: 1 })

export default mongoose.model<IEmployeeProfile>(
	'EmployeeProfile',
	EmployeeProfileSchema
)
