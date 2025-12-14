import AuditLog from '../models/AuditLog';
import logger from '../logger';

interface AuditEntry {
  collectionName: string;
  documentId: unknown;
  action: 'create' | 'update' | 'delete' | string;
  user?: unknown;
  before?: unknown;
  after?: unknown;
}

export default async function safeAuditLog(entry: AuditEntry) {
  try {
    await AuditLog.create(entry as any);
  } catch (err) {
    // Do not let audit failures block the main operation; just log a warning.
    logger.warn({ err, entry }, `Failed to write audit log (${entry.collectionName})`);
  }
}
