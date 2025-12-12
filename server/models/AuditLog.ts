import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  collectionName: string;
  documentId: mongoose.Types.ObjectId | string;
  action: 'create' | 'update' | 'delete';
  user?: mongoose.Types.ObjectId;
  before?: unknown;
  after?: unknown;
  createdAt: Date;
}

const auditSchema: Schema = new Schema({
  collectionName: { type: String, required: true },
  documentId: { type: Schema.Types.Mixed, required: true },
  action: { type: String, enum: ['create', 'update', 'delete'], required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAuditLog>('AuditLog', auditSchema);
