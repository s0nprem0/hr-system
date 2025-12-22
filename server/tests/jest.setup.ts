import '../../tests/setup-tests'

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import createApp from '../app'
import http from 'http'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import RefreshToken from '../models/RefreshToken'
import logger from '../logger'
import crypto from 'crypto'

let mongo: MongoMemoryServer | null = null
let server: http.Server | null = null

export default async function () {
	// Ensure the app and middlewares treat this as a test run
	process.env.NODE_ENV = process.env.NODE_ENV || 'test'
	// Provide a test JWT key if not set so login/signing works in tests
	process.env.JWT_KEY = process.env.JWT_KEY || 'test-jwt-key'
	// Start in-memory mongo
	mongo = await MongoMemoryServer.create()
	const uri = mongo.getUri()
	await mongoose.connect(uri)

	// Remove any legacy unique index on `token` left from older schema versions.
	// In CI / persistent dev DBs this avoids duplicate-null errors when migrating to `tokenHash`.
	try {
		if (
			RefreshToken.collection &&
			typeof RefreshToken.collection.indexes === 'function'
		) {
			const indexes = await RefreshToken.collection.indexes()
			logger.debug({ indexes }, 'jest.setup: refreshToken indexes')
			for (const idx of indexes) {
				if (idx.key && (idx.key as any).token === 1) {
					logger.warn({ index: idx.name }, 'jest.setup: dropping legacy index')
					if (idx.name) {
						await RefreshToken.collection.dropIndex(idx.name)
					}
				}
			}
		}
	} catch (e) {
		// ignore if index doesn't exist or drop fails in ephemeral env
		logger.warn({ err: e }, 'jest.setup: dropIndex error (ignored)')
	}

	// Seed an admin user for tests
	const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com'
	const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
	const existing = await User.findOne({ email: adminEmail })
	if (!existing) {
		const hashed = await bcrypt.hash(adminPassword, 10)
		await User.create({
			name: 'Admin',
			email: adminEmail,
			password: hashed,
			role: 'admin',
		})
	}

	// Start the app on an ephemeral port
	const app = createApp()
	server = http.createServer(app)
	await new Promise<void>((resolve) => {
		server!.listen(0, resolve)
	})
	const addr = server.address()
	const port = typeof addr === 'object' && addr ? addr.port : 5000
	process.env.TEST_SERVER_URL = `http://127.0.0.1:${port}`

	// Create a JWT and refresh token for the seeded admin so tests can reuse them
	try {
		const admin = await User.findOne({ email: adminEmail })
		const jwtKey = process.env.JWT_KEY || 'test-jwt-key'
		if (admin) {
			const token = jwt.sign({ _id: admin._id, role: admin.role }, jwtKey, {
				expiresIn: '1h',
			})
			process.env.ADMIN_TOKEN = token

			const refreshValue = crypto.randomBytes(48).toString('hex')
			const refreshHash = crypto
				.createHash('sha256')
				.update(refreshValue)
				.digest('hex')
			const refresh = await RefreshToken.create({
				tokenHash: refreshHash,
				user: admin._id,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			})
			// Expose the raw refresh token value (the server would set this in a cookie)
			process.env.ADMIN_REFRESH = refreshValue
		}
	} catch (err) {
		// don't fail setup if token creation fails; tests will fallback to HTTP login
	}

	// teardown after all tests
	// @ts-ignore - Jest provides global afterAll
	afterAll(async () => {
		if (server) {
			await new Promise<void>((resolve) => server!.close(() => resolve()))
			server = null
		}
		await mongoose.disconnect()
		if (mongo) {
			await mongo.stop()
			mongo = null
		}
	})
}
