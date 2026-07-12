const mongoose = require('mongoose');
const { ASSIGNEE_TYPE, ALLOCATION_STATUS } = require('../constants/enums');

const allocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    assigneeType: {
      type: String,
      enum: Object.values(ASSIGNEE_TYPE),
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Polymorphic ref — refPath used on populate
      refPath: 'assigneeType',
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ALLOCATION_STATUS),
      default: ALLOCATION_STATUS.ACTIVE,
    },
    allocatedAt: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date, default: null },
    returnedAt: { type: Date, default: null },
    returnConditionNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Partial unique index: only one Active allocation per asset at a time
allocationSchema.index(
  { asset: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Active' } }
);

module.exports = mongoose.model('Allocation', allocationSchema);
