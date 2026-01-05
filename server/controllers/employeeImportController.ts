import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import validation from '../utils/validation'
import { sendSuccess, sendError } from '../utils/apiResponse'
import logger from '../logger'
import User from '../models/User'
import employeeService from '../services/employeeService'
import validators from '../validators/zodValidators'

// --- Helpers ---

function parseCSV(text: string) {
	const rows: string[][] = []
	let cur = ''
	let inQuotes = false
	let row: string[] = []

	for (let i = 0; i < text.length; i++) {
		const ch = text[i]
		if (ch === '"') {
			if (inQuotes && text[i + 1] === '"') {
				cur += '"'
				i++
			} else {
				inQuotes = !inQuotes
			}
			continue
		}
		if (ch === ',' && !inQuotes) {
			row.push(cur)
			cur = ''
			continue
		}
		if ((ch === '\n' || ch === '\r') && !inQuotes) {
			if (cur !== '' || row.length > 0) {
				row.push(cur)
				rows.push(row)
				row = []
				cur = ''
			}
			// skip additional CR/LF
			if (ch === '\r' && text[i + 1] === '\n') i++
			continue
		}
		cur += ch
	}
	if (cur !== '' || row.length > 0) {
		row.push(cur)
		rows.push(row)
	}
	return rows
}

const ALLOWED_FIELDS = [
	'firstName',
	'lastName',
	'email',
	'jobTitle',
	'department',
	'salary',
	'role',
]

// Shared validation and mapping logic
async function processRows(rows: string[][], mapping: Record<string, string>) {
	if (!rows || rows.length === 0) throw new Error('No rows to process')
	const header = rows[0]!.map((h) => String(h || '').trim())
	const dataRows = rows.slice(1)

	// Pre-calculate column indices
	const colMap = header.map((h) => {
		const target = mapping[h]
		return target && target !== 'ignore' && ALLOWED_FIELDS.includes(target)
			? target
			: null
	})

	// Batch check emails for duplicates
	const emailIdx = colMap.indexOf('email')
	const existingEmails = new Set<string>()

	if (emailIdx !== -1) {
		// Collect sanitized email strings only (no undefined)
		const emailsToCheck: string[] = dataRows.reduce<string[]>((acc, r) => {
			const raw = r[emailIdx]
			const val =
				typeof raw === 'string'
					? raw.trim()
					: raw == null
					? ''
					: String(raw).trim()
			if (val && /\S+@\S+\.\S+/.test(val)) acc.push(val)
			return acc
		}, [])

		if (emailsToCheck.length > 0) {
			const foundUsers = await User.find(
				{ email: { $in: emailsToCheck } },
				{ email: 1 }
			).lean()
			foundUsers.forEach((u) => existingEmails.add(String(u.email)))
		}
	}

	const results = []

	for (const r of dataRows) {
		const mapped: Record<string, any> = {}
		const errors: string[] = []

		colMap.forEach((target, i) => {
			if (!target) return
			const val = r[i] ? String(r[i]).trim() : ''

			if (target === 'salary') {
				if (val !== '') {
					const num = Number(val)
					if (Number.isNaN(num)) {
						errors.push('Salary must be a number')
					} else {
						mapped.salary = num
					}
				}
			} else if (target === 'department') {
				if (val) {
					if (!validation.isObjectId(val)) {
						errors.push('Invalid Department ID')
					} else {
						mapped.department = val
					}
				}
			} else {
				mapped[target] = val
			}
		})

		// Validation
		const email = mapped.email
		if (!email || !validation.isEmail(email)) {
			errors.push('Valid email required')
		} else if (existingEmails.has(email)) {
			errors.push('Email already exists')
		}

		if (!mapped.firstName) errors.push('First name required')
		if (!mapped.lastName) errors.push('Last name required')

		// Construct final User object shape (for insertion)
		const finalUser = {
			name: `${mapped.firstName || ''} ${mapped.lastName || ''}`.trim(),
			email: mapped.email,
			role: mapped.role || 'employee',
			profile: {
				designation: mapped.jobTitle,
				department: mapped.department,
				salary: mapped.salary,
			},
			// password omitted: service will generate secure temporary password when creating user
		}

		results.push({ finalUser, mapped, errors })
	}

	return { header, results }
}

// --- Controllers ---

export const importDryRun = async (req: Request, res: Response) => {
	try {
		const { csv, mapping } = req.body as {
			csv?: string
			mapping?: Record<string, string>
		}
		if (!csv) return sendError(res, 'CSV is required', 400)

		const rows = parseCSV(csv)
		if (!rows.length) return sendError(res, 'Empty CSV', 400)

		const { header, results } = await processRows(rows, mapping || {})

		// Format for frontend preview
		const preview = results.map((r) => ({
			mapped: r.mapped,
			errors: r.errors,
		}))

		return sendSuccess(res, { header, preview })
	} catch (err: unknown) {
		logger.error({ err }, 'Import Dry Run Error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}

export const importCommit = async (req: Request, res: Response) => {
	try {
		const parsed = validators.ImportCommitSchema.safeParse(req.body)
		if (!parsed.success) {
			const errors = validators.formatZodErrors(parsed.error)
			return sendError(res, 'Validation failed', 400, { errors })
		}

		const { csv, mapping } = parsed.data

		const rows = parseCSV(csv)
		if (!rows.length) return sendError(res, 'Empty CSV', 400)

		const { results } = await processRows(
			rows,
			(mapping || {}) as Record<string, string>
		)

		// Filter only valid rows
		const validRows = results.filter((r) => r.errors.length === 0)

		if (validRows.length === 0) {
			return sendError(res, 'No valid rows found to import', 400)
		}

		// Create users one-by-one via employeeService to ensure profile creation and auditing.
		let imported = 0
		let failed = 0
		for (const r of validRows) {
			const dto = r.finalUser
			try {
				// pass audit user id if available
				const auditUser = (req.user as any)?._id
				await employeeService.createUserAndProfile(dto, auditUser)
				imported++
			} catch (e) {
				failed++
				logger.warn(
					{ err: e, row: dto },
					'Import commit: row failed (continued)'
				)
			}
		}

		return sendSuccess(res, {
			imported,
			failed,
			total: results.length,
		})
	} catch (err: unknown) {
		logger.error({ err }, 'Import Commit Error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}
