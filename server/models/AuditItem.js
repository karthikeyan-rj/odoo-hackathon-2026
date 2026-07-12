const mongoose = require('mongoose');

const auditItemSchema = new mongoose.Schema(
  {
    auditCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditCycle',
      required: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Discrepancy'],
      default: 'Pending',
    },
    notes: { type: String, trim: true },
    auditedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditItem', auditItemSchema);
