import mongoose, { Schema, Document } from 'mongoose'

export interface IRefreshToken extends Document {
	tokenHash: string
	user: mongoose.Types.ObjectId
	expiresAt: Date
	revoked?: boolean
	createdAt: Date
}

const refreshTokenSchema: Schema = new Schema({
	// store a hash of the refresh token (sha256) to avoid storing raw tokens in DB
	tokenHash: { type: String, required: true, unique: true },
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	expiresAt: { type: Date, required: true },
	revoked: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
})

// Ensure expired refresh tokens are automatically removed by MongoDB
// `expireAfterSeconds: 0` makes the document expire at the time in `expiresAt`.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema)
