const mongoose = require("mongoose");
const {
  USER_ROLES,
  ACTIVE_STATUS,
} = require("../constants/enums");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "Employee",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    status: {
      type: String,
      enum: ACTIVE_STATUS,
      default: "Active",
    },

    roleAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    roleAssignedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// unique email index is created automatically by { unique: true } on the field
userSchema.index({ department: 1 });
userSchema.index({ role: 1, status: 1 });

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
