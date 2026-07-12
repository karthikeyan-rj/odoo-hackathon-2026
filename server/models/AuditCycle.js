const mongoose = require("mongoose");
const {
  AUDIT_STATUSES,
} = require("../constants/enums");

const auditCycleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    scopeDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    scopeLocation: {
      type: String,
      trim: true,
      default: "",
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    auditors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: AUDIT_STATUSES,
      default: "Open",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditCycleSchema.pre(
  "validate",
  function validateDateRange(next) {
    if (
      this.startDate &&
      this.endDate &&
      this.endDate < this.startDate
    ) {
      return next(
        new Error("Audit endDate cannot be before startDate")
      );
    }

    next();
  }
);

auditCycleSchema.index({ status: 1 });
auditCycleSchema.index({ scopeDepartment: 1 });
auditCycleSchema.index({ auditors: 1 });

module.exports =
  mongoose.models.AuditCycle ||
  mongoose.model("AuditCycle", auditCycleSchema);
