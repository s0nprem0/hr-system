import mongoose, { Schema, Document } from 'mongoose'

export interface IAttendance extends Document {
	user: mongoose.Types.ObjectId
	date: Date
	checkIn?: Date
	checkOut?: Date
	location?: string
	createdAt: Date
}

const attendanceSchema = new Schema<IAttendance>({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	date: { type: Date, required: true },
	checkIn: { type: Date },
	checkOut: { type: Date },
	location: { type: String },
	createdAt: { type: Date, default: Date.now },
})

attendanceSchema.index({ user: 1, date: 1 })

export default mongoose.model<IAttendance>('Attendance', attendanceSchema)
