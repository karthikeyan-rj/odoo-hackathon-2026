const mongoose = require("mongoose");
const {
  AUDIT_RESULTS,
} = require("../constants/enums");

const auditItemSchema = new mongoose.Schema(
  {
    auditCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuditCycle",
      required: true,
    },

    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    result: {
      type: String,
      enum: AUDIT_RESULTS,
      default: "Pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    checkedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevents the same asset from being added twice to one audit cycle.
auditItemSchema.index(
  {
    auditCycle: 1,
    asset: 1,
  },
  {
    unique: true,
  }
);

auditItemSchema.index({
  auditCycle: 1,
  result: 1,
});

module.exports =
  mongoose.models.AuditItem ||
  mongoose.model("AuditItem", auditItemSchema);
