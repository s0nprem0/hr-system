import mongoose, { Schema, Document } from 'mongoose'
import { encrypt, decrypt } from '../utils/encryption'

export interface IEmployeeProfile extends Document {
	user: mongoose.Types.ObjectId
	// Employment Details
	department?: mongoose.Types.ObjectId
	jobTitle?: string
	employmentType: 'full-time' | 'part-time' | 'contract' | 'intern'
	status: 'active' | 'on-leave' | 'terminated'
	dateOfJoining?: Date

	// Compensation (Encrypted)
	salary: string // Stored as encrypted string, accessed as string/number via getters
	currency: string

	// Personal Details
	phone?: string // Encrypted
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

		// Sensitive Fields
		salary: {
			type: String,
			set: (v: string | number) => encrypt(v),
			get: (v: string) => {
				const d = decrypt(v)
				return d ? Number(d) : 0
			},
		},
		phone: {
			type: String,
			set: (v: string) => encrypt(v),
			get: (v: string) => decrypt(v),
		},

		currency: { type: String, default: 'USD' },

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
	{
		timestamps: true,
		toJSON: { getters: true }, // Ensure getters run when converting to JSON
		toObject: { getters: true },
	}
)

// Index for frequent filters
EmployeeProfileSchema.index({ department: 1 })
EmployeeProfileSchema.index({ status: 1 })

export default mongoose.model<IEmployeeProfile>(
	'EmployeeProfile',
	EmployeeProfileSchema
)
