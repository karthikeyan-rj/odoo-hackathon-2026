const express = require('express');
const Booking = require('../models/Booking');
const { requireAuth } = require('../middleware/auth.middleware');
const { createBooking, cancelBooking, rescheduleBooking } = require('../services/booking.service');

const router = express.Router();
router.use(requireAuth);

// ── POST /api/bookings ────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { resourceId, startTime, endTime, purpose } = req.body;
    if (!resourceId || !startTime || !endTime) {
      return res.status(400).json({ success: false, data: null, message: 'resourceId, startTime, endTime are required.' });
    }

    const booking = await createBooking({
      resourceId,
      requestedBy: req.user._id,
      startTime,
      endTime,
      purpose,
    });

    return res.status(201).json({ success: true, data: booking, message: 'Booking created.' });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ success: false, data: null, message: err.message });
    }
    if (err.statusCode === 400 || err.statusCode === 404) {
      return res.status(err.statusCode).json({ success: false, data: null, message: err.message });
    }
    next(err);
  }
});

// ── GET /api/bookings ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.resource) filter.resource = req.query.resource;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.startDate && req.query.endDate) {
      filter.startTime = { $gte: new Date(req.query.startDate) };
      filter.endTime = { $lte: new Date(req.query.endDate) };
    }

    const bookings = await Booking.find(filter)
      .populate('resource', 'assetTag name')
      .populate('requestedBy', 'name email')
      .sort({ startTime: 1 });

    return res.status(200).json({ success: true, data: bookings, message: 'Bookings fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/bookings/:id/cancel ────────────────────────────────────────────
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const booking = await cancelBooking(req.params.id);
    return res.status(200).json({ success: true, data: booking, message: 'Booking cancelled.' });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, data: null, message: err.message });
    }
    next(err);
  }
});

// ── PATCH /api/bookings/:id/reschedule ────────────────────────────────────────
router.patch('/:id/reschedule', async (req, res, next) => {
  try {
    const { newStart, newEnd } = req.body;
    if (!newStart || !newEnd) {
      return res.status(400).json({ success: false, data: null, message: 'newStart and newEnd are required.' });
    }

    const booking = await rescheduleBooking({ bookingId: req.params.id, newStart, newEnd });
    return res.status(200).json({ success: true, data: booking, message: 'Booking rescheduled.' });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ success: false, data: null, message: err.message });
    }
    if (err.statusCode === 400 || err.statusCode === 404) {
      return res.status(err.statusCode).json({ success: false, data: null, message: err.message });
    }
    next(err);
  }
});

module.exports = router;
