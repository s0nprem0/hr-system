import dotenv from 'dotenv'
import mongoose from 'mongoose'
import createApp from './app'
import logger from './logger'

// Load environment variables from .env if present
dotenv.config()

// Startup environment validation (fail fast if critical secrets missing)
const requiredEnvs = ['JWT_KEY']
const missing = requiredEnvs.filter((k) => !process.env[k])
if (missing.length) {
	logger.error(
		`Missing required env vars: ${missing.join(
			', '
		)}. Set them in .env or the environment.`
	)
	process.exit(1)
}

const app = createApp()

// Connect to MongoDB (safe: avoid passing undefined to mongoose.connect)
const connectDB = async () => {
	const mongoUri =
		process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/hr-system'
	if (!process.env.MONGO_URI) {
		logger.warn('MONGO_URI not set — falling back to local MongoDB', {
			mongoUri,
		})
	}

	try {
		await mongoose.connect(mongoUri)
		logger.info('MongoDB connected')
		return true
	} catch (err) {
		logger.error({ err }, 'DB Connection Error')
		return false
	}
}

// Connect to DB first, then start the server. Exit if DB connection fails.
connectDB()
	.then((ok) => {
		if (!ok) {
			logger.error('Failed to connect to DB. Server will not start.')
			process.exit(1)
		}

		const PORT = process.env.PORT || 5000
		app.listen(PORT, () => {
			logger.info(`Server is running on port ${PORT}`)
		})
	})
	.catch((err) => {
		logger.error({ err }, 'Unexpected error during startup')
		process.exit(1)
	})
