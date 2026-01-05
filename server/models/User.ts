import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
	name: string
	email: string
	password: string
	role: 'admin' | 'hr' | 'employee'
	createdAt: Date
	// Note: 'profile' field is removed. Data now lives in EmployeeProfile model.
}

const userSchema: Schema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: {
		type: String,
		enum: ['admin', 'hr', 'employee'],
		default: 'employee',
	},
	createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IUser>('User', userSchema)
