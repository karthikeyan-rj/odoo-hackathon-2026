const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth.middleware");
const { createBooking } = require("../services/bookingService");
const { createNotification } = require("../services/notification.service");

// GET /api/bookings - List all bookings
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Keep the calendar truthful without requiring a background worker.
    const now = new Date();
    await Booking.updateMany({ status: "Upcoming", startTime: { $lte: now }, endTime: { $gt: now } }, { status: "Ongoing" });
    await Booking.updateMany({ status: { $in: ["Upcoming", "Ongoing"] }, endTime: { $lte: now } }, { status: "Completed" });
    const filter = {};
    if (req.user.role === "Employee") {
      filter.requestedBy = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .populate("resource")
      .populate("requestedBy")
      .populate("bookedForDepartment");

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/bookings - Create booking
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { resource, startTime, endTime, purpose, bookedForDepartment } = req.body;

    if (!resource || !startTime || !endTime) {
      return res.status(400).json({ error: "Resource, startTime, and endTime are required." });
    }

    const booking = await createBooking({
      resourceId: resource,
      requestedBy: req.user._id,
      bookedForDepartment: bookedForDepartment || req.user.department,
      purpose,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    const Asset = require("../models/Asset");
    const { logActivity } = require("../services/activityLog.service");
    const dbResource = await Asset.findById(resource);
    await logActivity({
      actor: req.user._id,
      action: "Resource Booked",
      entityType: "Booking",
      entityId: booking._id,
      details: { resourceName: dbResource?.name, tag: dbResource?.assetTag }
    });
    await createNotification({ userId: req.user._id, type: "Booking Confirmed", message: `${dbResource?.name || "Resource"} is booked for ${new Date(startTime).toLocaleString()}.`, entityType: "Booking", entityId: booking._id });

    return res.status(201).json(booking);
  } catch (error) {
    if (error.message.includes("overlap") || error.message.includes("not bookable")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/bookings/:id/cancel - Cancel booking
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.status = "Cancelled";
    await booking.save();
    await createNotification({ userId: booking.requestedBy, type: "Booking Cancelled", message: "Your resource booking was cancelled.", entityType: "Booking", entityId: booking._id });
    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
