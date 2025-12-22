import mongoose, { Schema, Document } from 'mongoose'

export interface IAuditLog extends Document {
	collectionName: string
	documentId: mongoose.Types.ObjectId | string
	action: 'create' | 'update' | 'delete'
	user?: mongoose.Types.ObjectId
	before?: unknown
	after?: unknown
	changes?: unknown[]
	message?: string
	createdAt: Date
}

const auditSchema: Schema = new Schema({
	collectionName: { type: String, required: true },
	documentId: { type: Schema.Types.Mixed, required: true },
	action: {
		type: String,
		enum: ['create', 'update', 'delete', 'access'],
		required: true,
	},
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	before: { type: Schema.Types.Mixed },
	after: { type: Schema.Types.Mixed },
	message: { type: String },
	changes: { type: Array },
	createdAt: { type: Date, default: Date.now },
})

// Indexes for common queries to improve read performance
auditSchema.index({ createdAt: -1 })
auditSchema.index({ collectionName: 1, documentId: 1 })
auditSchema.index({ collectionName: 1, createdAt: -1 })
auditSchema.index({ user: 1 })

export default mongoose.model<IAuditLog>('AuditLog', auditSchema)
