import AuditLog, { IAuditLog } from '../models/AuditLog'
import logger from '../logger'

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

function shallowDiff(before: unknown, after: unknown) {
	try {
		if (!before || !after) return null
		const b =
			typeof before === 'object' && before
				? (before as Record<string, unknown>)
				: {}
		const a =
			typeof after === 'object' && after
				? (after as Record<string, unknown>)
				: {}
		const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]))
		const changes: string[] = []
		for (const k of keys) {
			const bv = (b as Record<string, unknown>)[k]
			const av = (a as Record<string, unknown>)[k]
			const bjs = typeof bv === 'string' ? bv : JSON.stringify(bv)
			const ajs = typeof av === 'string' ? av : JSON.stringify(av)
			if (bjs !== ajs) {
				changes.push(`${k}: ${bjs ?? 'null'} → ${ajs ?? 'null'}`)
			}
		}
		return changes.length ? changes.join('; ') : null
	} catch (err) {
		return null
	}
}

export default async function safeAuditLog(entry: AuditEntry) {
	try {
		// compute a human-friendly message if not provided
		let message = entry.message
		if (!message) {
			const idStr = entry.documentId ? String(entry.documentId) : 'unknown id'
			if (entry.action === 'create') {
				message = `Created ${entry.collectionName} (${idStr})`
			} else if (entry.action === 'delete') {
				message = `Deleted ${entry.collectionName} (${idStr})`
			} else if (entry.action === 'update') {
				const diff = shallowDiff(entry.before, entry.after)
				message = diff
					? `Updated ${entry.collectionName} (${idStr}) — ${diff}`
					: `Updated ${entry.collectionName} (${idStr})`
			} else {
				message = `${entry.action} on ${entry.collectionName} (${idStr})`
			}
		}

		await AuditLog.create({
			...(entry as Partial<IAuditLog>),
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
