const mongoose = require("mongoose");
const {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
} = require("../constants/enums");

const maintenanceRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    priority: {
      type: String,
      enum: MAINTENANCE_PRIORITIES,
      default: "Medium",
    },

    attachmentUrl: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: MAINTENANCE_STATUSES,
      default: "Pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    technicianName: {
      type: String,
      trim: true,
      default: "",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

maintenanceRequestSchema.index({
  asset: 1,
  status: 1,
});

maintenanceRequestSchema.index({ raisedBy: 1 });
maintenanceRequestSchema.index({ priority: 1 });
maintenanceRequestSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.MaintenanceRequest ||
  mongoose.model(
    "MaintenanceRequest",
    maintenanceRequestSchema
  );
