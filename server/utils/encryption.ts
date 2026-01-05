import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
// Ensure you have ENCRYPTION_KEY in your .env (32 chars)
// Fallback is ONLY for dev/testing to prevent crashes
const KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'
const IV_LENGTH = 16

export function encrypt(text: string | number | undefined): string | undefined {
	if (text == null || text === '') return undefined
	const str = String(text)
	const iv = crypto.randomBytes(IV_LENGTH)
	const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv)
	let encrypted = cipher.update(str)
	encrypted = Buffer.concat([encrypted, cipher.final()])
	return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string | undefined): string | undefined {
	if (!text) return undefined
	try {
		const parts = text.split(':')
		if (parts.length !== 2) return text // Not encrypted or legacy data

		const iv = Buffer.from(parts[0], 'hex')
		const encryptedText = Buffer.from(parts[1], 'hex')
		const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv)
		let decrypted = decipher.update(encryptedText)
		decrypted = Buffer.concat([decrypted, decipher.final()])
		return decrypted.toString()
	} catch (error) {
		// If decryption fails, return original (or handle error)
		console.error('Decryption failed:', error)
		return text
	}
}
