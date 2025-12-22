import AuditLog, { IAuditLog } from '../models/AuditLog'
import logger from '../logger'

type AuditEntry = Partial<
	Pick<
		IAuditLog,
		'collectionName' | 'documentId' | 'action' | 'user' | 'before' | 'after'
	>
> & { collectionName: string; action: IAuditLog['action'] }

export default async function safeAuditLog(entry: AuditEntry) {
	try {
		await AuditLog.create(entry as Partial<IAuditLog>)
	} catch (err) {
		// Do not let audit failures block the main operation; just log a warning.
		logger.warn(
			{ err, entry },
			`Failed to write audit log (${entry.collectionName})`
		)
	}
}
