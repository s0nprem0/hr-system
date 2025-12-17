import type { Request, Response } from 'express';
import AuditLog from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listAuditLogs(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, parseInt((req.query.limit as string) || '20', 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.collectionName) filter.collectionName = String(req.query.collectionName);
    if (req.query.action) filter.action = String(req.query.action);
    if (req.query.documentId) filter.documentId = req.query.documentId;
    if (req.query.user) filter.user = req.query.user;

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(String(req.query.from));
      if (req.query.to) filter.createdAt.$lte = new Date(String(req.query.to));
    }

    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      AuditLog.countDocuments(filter),
    ]);

    return sendSuccess(res, { items, total, page, limit });
  } catch (err: unknown) {
    return sendError(res, 'Failed to list audit logs', 500, err);
  }
}

export async function getAuditLog(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const entry = await AuditLog.findById(id).lean();
    if (!entry) return sendError(res, 'Audit entry not found', 404);
    return sendSuccess(res, entry);
  } catch (err: unknown) {
    return sendError(res, 'Failed to fetch audit log', 500, err);
  }
}
