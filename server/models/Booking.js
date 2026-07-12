const mongoose = require("mongoose");
const {
  BOOKING_STATUSES,
} = require("../constants/enums");

const bookingSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookedForDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    purpose: {
      type: String,
      trim: true,
      default: "",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "Upcoming",
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre("validate", function validateTime(next) {
  if (
    this.startTime &&
    this.endTime &&
    this.endTime <= this.startTime
  ) {
    return next(
      new Error("End time must be after start time")
    );
  }

  next();
});

bookingSchema.index({
  resource: 1,
  startTime: 1,
  endTime: 1,
  status: 1,
});

bookingSchema.index({ requestedBy: 1 });
bookingSchema.index({ bookedForDepartment: 1 });

module.exports =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
