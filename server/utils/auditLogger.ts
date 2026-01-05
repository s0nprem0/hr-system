import AuditLog, { IAuditLog } from '../models/AuditLog'
import logger from '../logger'
import crypto from 'crypto'
import mongoose from 'mongoose'

type AuditEntry = Partial<
	Pick<
		IAuditLog,
		| 'collectionName'
		| 'documentId'
		| 'action'
		| 'user'
		| 'before'
		| 'after'
		| 'message'
	>
> & { collectionName: string; action: IAuditLog['action']; message?: string }

const MAX_CHANGE_ENTRIES = 30
const MAX_FIELD_LENGTH = 200
const MAX_PAYLOAD_BYTES = 8 * 1024 // 8 KB per before/after stored inline
const MAX_DEPTH = 3

function isObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function redactString(s: string) {
	try {
		// email
		const emailRe = /([\w.%+-]{1})([\w.%+-]*?)@([\w.-]+\.[A-Za-z]{2,})/i
		if (emailRe.test(s))
			return s.replace(emailRe, (_m, a, _b, d) => `${a}***@${d}`)

		// SSN-like
		const ssnRe = /\b\d{3}-\d{2}-\d{4}\b/
		if (ssnRe.test(s)) return s.replace(/\d/g, '*')

		// phone-ish (simple)
		const phoneRe = /\+?[0-9][0-9()\-\s]{6,}[0-9]/
		if (phoneRe.test(s)) return s.replace(/\d(?!.*\d{0,2}$)/g, '*')

		if (s.length > MAX_FIELD_LENGTH) return s.slice(0, MAX_FIELD_LENGTH) + '…'
		return s
	} catch {
		return s
	}
}

function redactValue(v: unknown, seen = new WeakSet(), depth = 0): unknown {
	if (v == null) return v
	if (typeof v === 'string') return redactString(v)
	if (typeof v === 'number' || typeof v === 'boolean') return v
	if (Array.isArray(v)) {
		if (depth >= MAX_DEPTH) return '[array]'
		return v.map((it) => redactValue(it, seen, depth + 1))
	}
	if (isObject(v)) {
		if (seen.has(v as object)) return '[circular]'
		if (depth >= MAX_DEPTH) return '[object]'
		seen.add(v as object)
		const out: Record<string, unknown> = {}
		for (const k of Object.keys(v as Record<string, unknown>)) {
			try {
				out[k] = redactValue((v as Record<string, unknown>)[k], seen, depth + 1)
			} catch {
				out[k] = '[error]'
			}
		}
		return out
	}
	try {
		return String(v).slice(0, MAX_FIELD_LENGTH)
	} catch {
		return '[unserializable]'
	}
}

function shortStringify(v: unknown) {
	try {
		if (typeof v === 'string') return v
		return JSON.stringify(v)
	} catch {
		return String(v)
	}
}

function structuredDiff(before: unknown, after: unknown) {
	try {
		const b = isObject(before) ? (before as Record<string, unknown>) : {}
		const a = isObject(after) ? (after as Record<string, unknown>) : {}
		const keys = Array.from(
			new Set([...Object.keys(b), ...Object.keys(a)])
		).slice(0, MAX_CHANGE_ENTRIES + 1)
		const changes: Array<{ path: string; before: unknown; after: unknown }> = []
		for (const k of keys) {
			const bv = (b as Record<string, unknown>)[k]
			const av = (a as Record<string, unknown>)[k]
			const rb = redactValue(bv)
			const ra = redactValue(av)
			const sb = shortStringify(rb) ?? 'null'
			const sa = shortStringify(ra) ?? 'null'
			if (sb !== sa) {
				changes.push({ path: k, before: rb, after: ra })
				if (changes.length >= MAX_CHANGE_ENTRIES) break
			}
		}
		return changes
	} catch {
		return []
	}
}

function sizeOf(obj: unknown) {
	try {
		return Buffer.byteLength(JSON.stringify(obj) || '', 'utf8')
	} catch {
		return Infinity
	}
}

export default async function safeAuditLog(entry: AuditEntry) {
	try {
		// redact before/after
		const redactedBefore = entry.before ? redactValue(entry.before) : undefined
		const redactedAfter = entry.after ? redactValue(entry.after) : undefined

		// compute structured changes
		let changes = structuredDiff(redactedBefore, redactedAfter)

		// Special handling for draft-like documents to avoid storing PII or large blobs.
		// For `employeeDrafts` we store a minimal summary (keys + short hash) and do
		// not include actual before/after values in the audit record.
		let summaryAfter: unknown | undefined = undefined
		if (entry.collectionName === 'employeeDrafts') {
			try {
				const keys = isObject(redactedAfter)
					? Object.keys(redactedAfter as Record<string, unknown>)
					: []
				const hash = crypto
					.createHash('sha256')
					.update(JSON.stringify(redactedAfter || ''))
					.digest('hex')
					.slice(0, 16)
				summaryAfter = { keys, redacted: true, hash }
				// represent changes as paths only (no before/after values)
				changes = keys.map((k) => ({
					path: k,
					before: undefined,
					after: undefined,
				}))
			} catch {
				summaryAfter = { redacted: true }
				changes = []
			}
		}

		// build a concise human message if not provided
		let message = entry.message
		if (!message) {
			const idStr = entry.documentId ? String(entry.documentId) : 'unknown id'
			if (entry.action === 'create') {
				message = `Created ${entry.collectionName} (${idStr})`
			} else if (entry.action === 'delete') {
				message = `Deleted ${entry.collectionName} (${idStr})`
			} else if (entry.action === 'update') {
				if (changes.length) {
					const preview = changes
						.slice(0, 3)
						.map(
							(c) =>
								`${c.path}: ${shortStringify(c.before)} → ${shortStringify(
									c.after
								)}`
						)
						.join('; ')
					message = `Updated ${entry.collectionName} (${idStr}) — ${preview}${
						changes.length > 3 ? ` (+${changes.length - 3} more)` : ''
					}`
				} else {
					message = `Updated ${entry.collectionName} (${idStr})`
				}
			} else {
				message = `${entry.action} on ${entry.collectionName} (${idStr})`
			}
		}

		// avoid storing very large payloads inline
		let storeBefore = redactedBefore
		let storeAfter = redactedAfter
		if (sizeOf(storeBefore) > MAX_PAYLOAD_BYTES) storeBefore = undefined
		if (sizeOf(storeAfter) > MAX_PAYLOAD_BYTES) storeAfter = undefined

		// If we created a summary for drafts, use that instead of raw after
		if (entry.collectionName === 'employeeDrafts' && summaryAfter) {
			storeAfter = summaryAfter
			// ensure we don't leak before values for drafts
			storeBefore = undefined
		}

		await AuditLog.create({
			collectionName: entry.collectionName,
			documentId: entry.documentId ?? undefined,
			action: entry.action,
			user: entry.user as unknown as mongoose.Types.ObjectId | undefined,
			before: storeBefore,
			after: storeAfter,
			changes: changes.length ? changes : undefined,
			message,
		} as Partial<IAuditLog>)
	} catch (err) {
		// Do not let audit failures block the main operation; just log a warning.
		logger.warn(
			{ err, entry },
			`Failed to write audit log (${entry.collectionName})`
		)
	}
}
