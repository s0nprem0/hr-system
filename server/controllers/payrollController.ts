import type { Request, Response } from 'express';
import Payroll from '../models/Payroll';
import User from '../models/User';
import logger from '../logger';
import { sendSuccess, sendError } from '../utils/apiResponse';
import safeAuditLog from '../utils/auditLogger';
import mongoose from 'mongoose';

const listPayroll = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.limit || 20);
    const employeeId = req.query.employeeId as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const filter: any = {};
    if (employeeId && mongoose.isValidObjectId(employeeId)) filter.employee = employeeId;
    if (from || to) filter.payDate = {};
    if (from) filter.payDate.$gte = new Date(from);
    if (to) filter.payDate.$lte = new Date(to);

    const total = await Payroll.countDocuments(filter);
    const items = await Payroll.find(filter)
      .populate('employee', 'name email role profile')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return sendSuccess(res, { items, total, page, pageSize });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, 'listPayroll error');
    return sendError(res, message, 500);
  }
};

const getPayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await Payroll.findById(id).populate('employee', 'name email role profile');
    if (!entry) return sendError(res, 'Payroll entry not found', 404);
    return sendSuccess(res, entry);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, 'getPayroll error');
    return sendError(res, message, 500);
  }
};

const createPayroll = async (req: Request, res: Response) => {
  try {
    const { employeeId, amount, payDate } = req.body;
    if (!mongoose.isValidObjectId(employeeId)) return sendError(res, 'Invalid employee id', 400);
    const employee = await User.findById(employeeId).select('_id');
    if (!employee) return sendError(res, 'Employee not found', 404);

    const entry = await Payroll.create({ employee: employeeId, amount, payDate: payDate ? new Date(payDate) : new Date() });
    const result = await Payroll.findById(entry._id).populate('employee', 'name email role profile');

    // audit log (non-blocking)
    await safeAuditLog({
      collectionName: 'Payroll',
      documentId: entry._id,
      action: 'create',
      user: req.user?._id,
      before: null,
      after: result,
    });

    return sendSuccess(res, result, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, 'createPayroll error');
    return sendError(res, message, 500);
  }
};

const updatePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Record<string, unknown>> = { ...req.body };
    if (updates.employeeId) {
      if (!mongoose.isValidObjectId(updates.employeeId)) return sendError(res, 'Invalid employee id', 400);
      updates.employee = updates.employeeId;
      delete updates.employeeId;
    }
    if (updates.payDate) updates.payDate = new Date(String(updates.payDate));

    const before = await Payroll.findById(id).lean();
    const updated = await Payroll.findByIdAndUpdate(id, updates, { new: true }).populate('employee', 'name email role profile');
    if (!updated) return sendError(res, 'Payroll entry not found', 404);

    await safeAuditLog({
      collectionName: 'Payroll',
      documentId: id,
      action: 'update',
      user: req.user?._id,
      before,
      after: updated,
    });

    return sendSuccess(res, updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, 'updatePayroll error');
    return sendError(res, message, 500);
  }
};

const deletePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = await Payroll.findByIdAndDelete(id).populate('employee', 'name email');
    if (!removed) return sendError(res, 'Payroll entry not found', 404);

    await safeAuditLog({
      collectionName: 'Payroll',
      documentId: id,
      action: 'delete',
      user: req.user?._id,
      before: removed,
      after: null,
    });

    return sendSuccess(res, removed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, 'deletePayroll error');
    return sendError(res, message, 500);
  }
};

export { listPayroll, getPayroll, createPayroll, updatePayroll, deletePayroll };
