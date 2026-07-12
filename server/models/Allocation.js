const mongoose = require("mongoose");
const {
  ALLOCATION_STATUSES,
} = require("../constants/enums");

const allocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    assigneeType: {
      type: String,
      enum: ["User", "Department"],
      required: true,
    },

    assigneeUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assigneeDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    allocatedAt: {
      type: Date,
      default: Date.now,
    },

    expectedReturnDate: {
      type: Date,
      default: null,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    returnConditionNotes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ALLOCATION_STATUSES,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

allocationSchema.pre("validate", function validateAssignee(next) {
  if (
    this.assigneeType === "User" &&
    (!this.assigneeUser || this.assigneeDepartment)
  ) {
    return next(
      new Error(
        "User allocation requires assigneeUser only"
      )
    );
  }

  if (
    this.assigneeType === "Department" &&
    (!this.assigneeDepartment || this.assigneeUser)
  ) {
    return next(
      new Error(
        "Department allocation requires assigneeDepartment only"
      )
    );
  }

  next();
});

// Partial unique index — only one Active allocation per asset at a time.
allocationSchema.index(
  { asset: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "Active",
    },
  }
);

allocationSchema.index({ asset: 1, status: 1 });
allocationSchema.index({ assigneeUser: 1 });
allocationSchema.index({ assigneeDepartment: 1 });
allocationSchema.index({ expectedReturnDate: 1, status: 1 });

module.exports =
  mongoose.models.Allocation ||
  mongoose.model("Allocation", allocationSchema);
