const mongoose = require("mongoose");
const { ACTIVE_STATUS } = require("../constants/enums");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },

    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    status: {
      type: String,
      enum: ACTIVE_STATUS,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

departmentSchema.pre("validate", function validateParent(next) {
  if (
    this._id &&
    this.parentDepartment &&
    this._id.equals(this.parentDepartment)
  ) {
    return next(
      new Error("A department cannot be its own parent")
    );
  }

  next();
});

// unique name index is created automatically by { unique: true } on the field
departmentSchema.index({ parentDepartment: 1 });
departmentSchema.index({ status: 1 });

module.exports =
  mongoose.models.Department ||
  mongoose.model("Department", departmentSchema);
