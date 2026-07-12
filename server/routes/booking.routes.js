const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth.middleware");
const { createBooking } = require("../services/bookingService");

// GET /api/bookings - List all bookings
router.get("/", authMiddleware, async (req, res) => {
  try {
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

    return res.status(201).json(booking);
  } catch (error) {
    if (error.message.includes("overlap") || error.message.includes("not bookable")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
