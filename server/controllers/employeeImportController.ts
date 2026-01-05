import type { Request, Response } from 'express'
import { sendSuccess, sendError } from '../utils/apiResponse'
import logger from '../logger'
import User from '../models/User'
import mongoose from 'mongoose'

// Very small CSV parser: handles quoted fields and simple commas
function parseCSV(text: string) {
	const rows: string[][] = []
	let cur: string = ''
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

// mapping: object where keys are header names and values are target fields
const allowedFields = [
	'firstName',
	'lastName',
	'email',
	'jobTitle',
	'department',
	'salary',
	'role',
]

const importDryRun = async (req: Request, res: Response) => {
	try {
		const { csv, mapping } = req.body as {
			csv?: string
			mapping?: Record<string, string>
		}
		if (!csv) return sendError(res, 'csv is required', 400)
		const rows = parseCSV(csv)
		if (!rows.length) return sendError(res, 'empty csv', 400)
		const header = rows[0].map((h) => String(h || '').trim())
		const dataRows = rows.slice(1)

		const preview: Array<{
			mapped: Record<string, unknown>
			errors: string[]
		}> = []
		for (const r of dataRows) {
			const mapped: Record<string, unknown> = {}
			const errors: string[] = []
			for (let i = 0; i < header.length; i++) {
				const col = header[i]
				const target = mapping && mapping[col]
				if (!target || target === 'ignore') continue
				if (!allowedFields.includes(target)) continue
				const val = r[i] != null ? String(r[i]).trim() : ''
				if (target === 'salary') {
					if (val !== '' && Number.isNaN(Number(val)))
						errors.push('salary must be a number')
					else if (val !== '') mapped['salary'] = Number(val)
				} else if (target === 'department') {
					if (val && !mongoose.isValidObjectId(val))
						errors.push('invalid department id')
					else if (val) mapped['department'] = val
				} else {
					mapped[target] = val
				}
			}
			// basic validation
			if (!mapped.email || !/\S+@\S+\.\S+/.test(String(mapped.email)))
				errors.push('valid email required')
			if (!mapped.firstName) errors.push('firstName required')
			if (!mapped.lastName) errors.push('lastName required')

			// check duplicate email in DB
			if (mapped.email) {
				// do not await many DB calls serially; but for simplicity, check
				// We will perform synchronous check by querying
				// (could be optimized)
				// eslint-disable-next-line no-await-in-loop
				const existing = await User.findOne({
					email: String(mapped.email),
				}).lean()
				if (existing) errors.push('email already exists')
			}

			preview.push({ mapped, errors })
		}

		return sendSuccess(res, { header, preview })
	} catch (err: unknown) {
		logger.error({ err }, 'importDryRun error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}

export { importDryRun }
