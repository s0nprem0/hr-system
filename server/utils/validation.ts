import mongoose from 'mongoose'

export type ValidationError = { field?: string; message: string }

export function isEmail(value: unknown) {
	if (typeof value !== 'string') return false
	return /\S+@\S+\.\S+/.test(value.trim())
}

export function isObjectId(value: unknown) {
	if (value == null) return false
	return mongoose.isValidObjectId(String(value))
}

export function toNumber(value: unknown): number | undefined {
	if (value == null) return undefined
	const n = Number(value)
	return Number.isFinite(n) ? n : undefined
}

export function sanitizeString(
	value: unknown,
	maxLength = 1000
): string | undefined {
	if (value == null) return undefined
	if (typeof value !== 'string') return String(value)
	const s = value.trim()
	return s.length === 0 ? undefined : s.slice(0, maxLength)
}

export function requireAuthUser(user: unknown): {
	id?: string
	err?: ValidationError
} {
	if (!user || typeof user !== 'object')
		return { err: { message: 'Unauthorized' } }
	// try common shapes
	const anyUser = user as any
	const id = anyUser._id ?? anyUser.id ?? anyUser.userId
	if (!id) return { err: { message: 'Unauthorized' } }
	return { id: String(id) }
}

export default {
	isEmail,
	isObjectId,
	toNumber,
	sanitizeString,
	requireAuthUser,
}
