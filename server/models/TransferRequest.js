const mongoose = require("mongoose");
const {
  TRANSFER_STATUSES,
} = require("../constants/enums");

const transferRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetType: {
      type: String,
      enum: ["User", "Department"],
      required: true,
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    targetDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: TRANSFER_STATUSES,
      default: "Requested",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transferRequestSchema.pre(
  "validate",
  function validateTarget(next) {
    if (
      this.targetType === "User" &&
      (!this.targetUser || this.targetDepartment)
    ) {
      return next(
        new Error(
          "User transfer requires targetUser only"
        )
      );
    }

    if (
      this.targetType === "Department" &&
      (!this.targetDepartment || this.targetUser)
    ) {
      return next(
        new Error(
          "Department transfer requires targetDepartment only"
        )
      );
    }

    next();
  }
);

transferRequestSchema.index({ asset: 1, status: 1 });
transferRequestSchema.index({ requestedBy: 1 });
transferRequestSchema.index({ targetUser: 1 });
transferRequestSchema.index({ targetDepartment: 1 });

module.exports =
  mongoose.models.TransferRequest ||
  mongoose.model(
    "TransferRequest",
    transferRequestSchema
  );
