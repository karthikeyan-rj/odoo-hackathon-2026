const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({
  entityType: 1,
  entityId: 1,
});

module.exports =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", activityLogSchema);
