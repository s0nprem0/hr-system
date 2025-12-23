import type { Request, Response } from 'express'
// express-validator handled via middleware; no local import needed
import User from '../models/User'
import bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import type { Secret } from 'jsonwebtoken'
import logger from '../logger'
import { sendSuccess, sendError } from '../utils/apiResponse'
import RefreshToken from '../models/RefreshToken'
import crypto from 'crypto'

// Runtime-safe helper to obtain a callable `sign` function from the jsonwebtoken import.
// Different bundlers / runtimes may expose the API as: `jwt.sign`, a default-exported
// function, or the module itself being the function. Normalize to a single callable.
function getJwtSign(): (
	payload: unknown,
	secret: Secret,
	options?: unknown
) => string {
	const mod: any = jwt as any
	if (typeof mod.sign === 'function') return mod.sign.bind(mod)
	if (typeof mod === 'function') return mod.bind(mod)
	if (mod && typeof mod.default === 'function') return mod.default.bind(mod)
	if (mod && mod.default && typeof mod.default.sign === 'function')
		return mod.default.sign.bind(mod.default)
	throw new Error('jsonwebtoken.sign is not available')
}

const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email })

		if (!user) {
			return sendError(res, 'Invalid credentials', 401)
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return sendError(res, 'Invalid credentials', 401)
		}

		const jwtKey = process.env.JWT_KEY
		if (!jwtKey) {
			// Use logger if available; require dynamically to avoid circular import errors
			const { default: logger } = await import('../logger')
			logger.error('JWT_KEY is not set in environment')
			return sendError(res, 'Server misconfiguration', 500)
		}

		const signFn = getJwtSign()
		const token = signFn({ _id: user._id, role: user.role }, jwtKey as Secret, {
			expiresIn: process.env.JWT_EXPIRES || '1h',
		})

		// create a refresh token and persist it, then set it in an httpOnly cookie
		logger.debug(
			{ user: user._id },
			'authController.login: creating refresh token'
		)
		const refreshTokenValue = crypto.randomBytes(48).toString('hex')
		const refreshTokenHash = crypto
			.createHash('sha256')
			.update(refreshTokenValue)
			.digest('hex')
		const refreshTtlSeconds = Number(
			process.env.REFRESH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7
		) // default 7 days

		// Defensive: drop any legacy unique index on `token` which would cause
		// duplicate-null errors (older schema stored `token` raw). Also ensure
		// the `tokenHash` unique index exists. These operate on the collection
		// directly and are best-effort; failures are non-fatal.
		try {
			if (
				RefreshToken.collection &&
				typeof RefreshToken.collection.indexes === 'function'
			) {
				const indexes = await RefreshToken.collection.indexes()
				logger.debug({ indexes }, 'authController.login: refreshToken indexes')
				for (const idx of indexes) {
					if (idx.key && (idx.key as any).token === 1) {
						logger.warn(
							{ index: idx.name },
							'authController.login: dropping legacy index'
						)
						await RefreshToken.collection.dropIndex(idx.name)
					}
				}
			}
		} catch (e) {
			logger.warn(
				{ err: e },
				'authController.login: error cleaning indexes (ignored)'
			)
		}

		try {
			if (
				RefreshToken.collection &&
				typeof RefreshToken.collection.createIndex === 'function'
			) {
				await RefreshToken.collection.createIndex(
					{ tokenHash: 1 },
					{ unique: true }
				)
			}
		} catch (e) {
			logger.warn(
				{ err: e },
				'authController.login: ensure tokenHash index error (ignored)'
			)
		}

		const refresh = await RefreshToken.create({
			tokenHash: refreshTokenHash,
			user: user._id,
			expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
		})
		logger.debug(
			{ id: refresh._id, tokenHash: refresh.tokenHash },
			'authController.login: refresh token created'
		)

		// set refresh token as httpOnly cookie (path scoped to auth routes)
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			path: '/api/auth',
			maxAge: refreshTtlSeconds * 1000,
		}
		// send raw token to client in httpOnly cookie; only the hash is stored server-side
		res.cookie('refreshToken', refreshTokenValue, cookieOptions)
		// Double-submit CSRF token (non-HttpOnly) so clients can read and include in requests
		const csrfValue = crypto.randomBytes(16).toString('hex')
		const csrfOptions = {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			path: '/',
			maxAge: refreshTtlSeconds * 1000,
		}
		res.cookie('csrfToken', csrfValue, csrfOptions)

		return sendSuccess(
			res,
			{ token, user: { _id: user._id, name: user.name, role: user.role } },
			200
		)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error)
		logger.error({ err: error }, 'authController.login error')
		return sendError(res, message, 500, error)
	}
}

const verify = (req: Request, res: Response) => {
	return sendSuccess(res, { user: req.user }, 200)
}

const register = async (req: Request, res: Response) => {
	try {
		const { name, email, password } = req.body
		const existing = await User.findOne({ email })
		if (existing) {
			return sendError(res, 'Email already in use', 409)
		}

		const hashed = await bcrypt.hash(password, 10)
		const created = await User.create({
			name,
			email,
			password: hashed,
			role: 'employee',
		})

		return sendSuccess(
			res,
			{ user: { _id: created._id, name: created.name, role: created.role } },
			201
		)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'Register error')
		return sendError(res, message, 500, err)
	}
}

// exported at bottom together with refresh/logout

const refresh = async (req: Request, res: Response) => {
	try {
		// allow refresh token via httpOnly cookie or request body (backwards compatible)
		const incomingRefresh = req.cookies?.refreshToken || req.body?.refreshToken
		// verify double-submit CSRF token
		const incomingCsrfHeader = (req.headers['x-csrf-token'] || '') as string
		const csrfCookie = req.cookies?.csrfToken
		if (
			!incomingCsrfHeader ||
			!csrfCookie ||
			incomingCsrfHeader !== csrfCookie
		) {
			return sendError(res, 'CSRF token missing or invalid', 403)
		}
		if (!incomingRefresh) return sendError(res, 'Refresh token required', 400)
		// Atomically find the refresh token which is not revoked and not expired, and mark it revoked in one operation.
		const now = new Date()
		const incomingHash = crypto
			.createHash('sha256')
			.update(incomingRefresh)
			.digest('hex')
		const found = await RefreshToken.findOneAndUpdate(
			{
				tokenHash: incomingHash,
				revoked: { $ne: true },
				expiresAt: { $gt: now },
			},
			{ $set: { revoked: true } },
			{ new: true }
		)

		// If we didn't find a valid token to rotate, check if the token exists and was already revoked
		if (!found) {
			const existing = await RefreshToken.findOne({ tokenHash: incomingHash })
			if (!existing)
				return sendError(res, 'Refresh token invalid or expired', 401)

			// Token exists but is already revoked -> possible reuse attack
			if (existing.revoked) {
				// Revoke all tokens for this user as a defensive measure
				try {
					await RefreshToken.updateMany(
						{ user: existing.user, revoked: { $ne: true } },
						{ $set: { revoked: true } }
					)
				} catch (e) {
					// log and continue to clear cookie
					logger.warn(
						{ err: e, user: existing.user },
						'Failed to revoke all refresh tokens during reuse handling'
					)
				}

				// Clear cookie and log the incident
				res.clearCookie('refreshToken', { path: '/api/auth' })
				logger.warn(
					{ user: existing.user, tokenHash: incomingHash },
					'Refresh token reuse detected - revoked all tokens for user'
				)
				return sendError(res, 'Refresh token reuse detected', 401)
			}

			// Token exists but is expired
			if (existing.expiresAt <= now)
				return sendError(res, 'Refresh token invalid or expired', 401)

			// Fallback: treat as invalid
			return sendError(res, 'Refresh token invalid', 401)
		}

		const user = await User.findById(found.user)
		if (!user) return sendError(res, 'User not found', 404)

		const jwtKey = process.env.JWT_KEY
		if (!jwtKey) return sendError(res, 'Server misconfiguration', 500)

		const signFn = getJwtSign()
		const token = signFn({ _id: user._id, role: user.role }, jwtKey as Secret, {
			expiresIn: process.env.JWT_EXPIRES || '1h',
		})

		// Issue a new refresh token (single-use). Persist and set it as httpOnly cookie.
		const newRefreshValue = crypto.randomBytes(48).toString('hex')
		const refreshTtlSeconds2 = Number(
			process.env.REFRESH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7
		)
		const newRefreshHash = crypto
			.createHash('sha256')
			.update(newRefreshValue)
			.digest('hex')
		const newRefresh = await RefreshToken.create({
			tokenHash: newRefreshHash,
			user: user._id,
			expiresAt: new Date(Date.now() + refreshTtlSeconds2 * 1000),
			revoked: false,
		})

		const cookieOptions2 = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			path: '/api/auth',
			maxAge: refreshTtlSeconds2 * 1000,
		}
		res.cookie('refreshToken', newRefreshValue, cookieOptions2)
		// rotate csrf token as well
		const newCsrf = crypto.randomBytes(16).toString('hex')
		res.cookie('csrfToken', newCsrf, {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: refreshTtlSeconds2 * 1000,
		})

		return sendSuccess(res, { token }, 200)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'authController.refresh error')
		return sendError(res, message, 500, err)
	}
}

const logout = async (req: Request, res: Response) => {
	try {
		// Require CSRF header for logout as well (double-submit)
		const incomingCsrfHeader = (req.headers['x-csrf-token'] || '') as string
		const csrfCookie = req.cookies?.csrfToken
		if (
			!incomingCsrfHeader ||
			!csrfCookie ||
			incomingCsrfHeader !== csrfCookie
		) {
			return sendError(res, 'CSRF token missing or invalid', 403)
		}

		// Allow cookie or body token for logout
		const incomingRefresh = req.cookies?.refreshToken || req.body?.refreshToken
		if (!incomingRefresh) return sendError(res, 'Refresh token required', 400)
		// Atomically mark the provided refresh token revoked (idempotent)
		const incomingHash = crypto
			.createHash('sha256')
			.update(incomingRefresh)
			.digest('hex')
		const result = await RefreshToken.findOneAndUpdate(
			{ tokenHash: incomingHash, revoked: { $ne: true } },
			{ $set: { revoked: true } },
			{ new: true }
		)
		// Clear cookie on logout (best-effort)
		res.clearCookie('refreshToken', { path: '/api/auth' })
		return sendSuccess(res, { revoked: !!result }, 200)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'authController.logout error')
		return sendError(res, message, 500, err)
	}
}

export { login, register, verify, refresh, logout }
