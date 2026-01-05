import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import authRouter from './routes/auth'
import csrfProtection from './middleware/csrfProtection'
import usersRouter from './routes/users'
import employeesRouter from './routes/employees'
import departmentsRouter from './routes/departments'
import payrollRouter from './routes/payroll'
import attendanceRouter from './routes/attendance'
import leaveRouter from './routes/leave'
import auditsRouter from './routes/audits'
import metricsRouter from './routes/metrics'
import approvalsRouter from './routes/approvals'
import errorHandler from './middleware/errorHandler'

export default function createApp() {
	const app = express()

	const isProd = process.env.NODE_ENV === 'production'

	const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
	app.use(helmet())

	// In production behind a proxy (e.g. Heroku / nginx), trust the first proxy
	// so that `req.secure` and `req.protocol` reflect the TLS state correctly.
	if (isProd) {
		app.set('trust proxy', 1)
		// Enforce HSTS for production deployments
		try {
			app.use(
				helmet.hsts({
					maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
					includeSubDomains: true,
					preload: true,
				})
			)
		} catch (e) {
			// If helmet.hsts is not available in this runtime, ignore and continue
			// (HSTS is a best-effort enhancement for production only).
		}

		// Redirect plain HTTP to HTTPS when not already secure. This helps ensure
		// cookies marked `Secure` are only sent over TLS.
		app.use((req, res, next) => {
			const forwardedProto = (req.headers['x-forwarded-proto'] || '') as string
			if (req.secure || forwardedProto.startsWith('https')) return next()
			const host = req.headers.host
			if (!host) return next()
			return res.redirect(301, `https://${host}${req.originalUrl}`)
		})
	}
	app.use(morgan('combined'))
	// Tighten CORS: accept only configured client origins (supports comma-separated list)
	const originsEnv = process.env.CLIENT_URLS || process.env.CLIENT_URL || ''
	const allowedOrigins = originsEnv
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)

	app.use(
		cors({
			origin: (origin, callback) => {
				// Allow requests without Origin (e.g., same-origin, non-browser clients)
				if (!origin) return callback(null, true)
				if (allowedOrigins.includes(origin)) return callback(null, true)
				return callback(new Error('CORS origin denied'))
			},
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
			exposedHeaders: [
				'RateLimit-Limit',
				'RateLimit-Remaining',
				'RateLimit-Reset',
			],
			preflightContinue: false,
			optionsSuccessStatus: 204,
		})
	)

	app.use(express.json())
	// parse cookies for refresh token handling
	app.use(cookieParser())

	// Apply server-side CSRF protection to auth routes (double-submit + origin/referrer
	// fallback). The auth controller already performs header+cookie checks for refresh
	// and logout; this middleware provides an additional centralized check for other
	// state-changing requests under /api/auth.
	app.use('/api/auth', csrfProtection(), authRouter)
	// Apply CSRF protection to state-changing API routes. Safe (GET/HEAD/OPTIONS)
	// requests are allowed through the middleware; state-changing requests
	// require either the double-submit CSRF header+cookie or a validated origin.
	app.use('/api/users', csrfProtection(), usersRouter)
	app.use('/api/employees', csrfProtection(), employeesRouter)
	app.use('/api/departments', csrfProtection(), departmentsRouter)
	app.use('/api/payroll', csrfProtection(), payrollRouter)
	app.use('/api/attendance', csrfProtection(), attendanceRouter)
	app.use('/api/leave', csrfProtection(), leaveRouter)
	app.use('/api/audits', csrfProtection(), auditsRouter)

	// Lightweight development endpoints used by the client dashboard.
	// These are intentionally mounted without CSRF middleware to simplify
	// local development; in production implement CSRF + auth/permission checks.
	app.use('/api/metrics', metricsRouter)
	app.use('/api/approvals', approvalsRouter)

	app.get('/health', (req, res) => {
		const uptime = process.uptime()
		const mem = process.memoryUsage()
		const mongoState = mongoose.connection.readyState // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
		const dbStatus =
			mongoState === 1
				? 'connected'
				: mongoState === 2
				? 'connecting'
				: mongoState === 3
				? 'disconnecting'
				: 'disconnected'

		const ok = mongoState === 1
		const statusCode = ok ? 200 : 503

		return res.status(statusCode).json({
			status: ok ? 'ok' : 'degraded',
			uptime,
			memory: {
				rss: mem.rss,
				heapTotal: mem.heapTotal,
				heapUsed: mem.heapUsed,
			},
			db: { state: mongoState, status: dbStatus },
		})
	})

	// centralized error handler
	app.use(errorHandler)

	return app
}
