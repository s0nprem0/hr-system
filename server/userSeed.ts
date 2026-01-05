import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User'
import dotenv from 'dotenv'
import logger from './logger'

dotenv.config()

// Safety: require explicit env var to run seeding to avoid accidental execution
if (process.env.ALLOW_SEED !== 'true') {
	logger.warn('Seeding disabled. Set ALLOW_SEED=true to run userSeed.ts')
	process.exit(0)
}

const connectDB = async () => {
	try {
		await mongoose.connect(
			process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hr-system'
		)
		logger.info('MongoDB connected (seed)')
	} catch (err) {
		logger.error({ err }, 'DB Connection Error (seed)')
	}
}
const userRegister = async () => {
	await connectDB()
	const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10)

	// Define seed accounts with env var overrides for CI/dev
	const seeds = [
		{
			name: 'Admin User',
			email: process.env.ADMIN_EMAIL || 'admin@localhost',
			password: process.env.ADMIN_PASSWORD || 'Admin123!@#',
			role: 'admin',
		},
		{
			name: 'HR User',
			email: process.env.HR_EMAIL || 'hr@localhost',
			password: process.env.HR_PASSWORD || 'HrUser123!@#',
			role: 'hr',
		},
		{
			name: 'Jane Employee',
			email: process.env.EMP_EMAIL || 'jane.employee@localhost',
			password: process.env.EMP_PASSWORD || 'Employee123!@#',
			role: 'employee',
		},
		{
			name: 'John Employee',
			email: process.env.EMP2_EMAIL || 'john.employee@localhost',
			password: process.env.EMP2_PASSWORD || 'Employee234!@#',
			role: 'employee',
		},
	]

	try {
		for (const u of seeds) {
			const exists = await User.findOne({ email: u.email })
			if (exists) {
				logger.info(`ℹ️ ${u.email} already exists, skipping`)
				continue
			}

			const hash = await bcrypt.hash(u.password, saltRounds)
			await User.create({
				name: u.name,
				email: u.email,
				password: hash,
				role: u.role,
			})
			logger.info(`✅ Created ${u.role} account: ${u.email}`)
		}
	} catch (error) {
		logger.error({ error }, 'Error seeding users')
	} finally {
		await mongoose.disconnect()
		logger.info('MongoDB disconnected (seed)')
	}
}

userRegister()
