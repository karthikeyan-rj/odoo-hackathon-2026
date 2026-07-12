const express = require('express');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/TransferRequest');
const { requireAuth } = require('../middleware/auth.middleware');
const { ASSET_STATUS, ALLOCATION_STATUS, BOOKING_STATUS, MAINTENANCE_STATUS, TRANSFER_STATUS } = require('../constants/enums');

const router = express.Router();
router.use(requireAuth);

// ── GET /api/dashboard/kpis ───────────────────────────────────────────────────
router.get('/kpis', async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
    ] = await Promise.all([
      // Count assets by status
      Asset.countDocuments({ status: ASSET_STATUS.AVAILABLE }),
      Asset.countDocuments({ status: ASSET_STATUS.ALLOCATED }),

      // Maintenance requests created today
      MaintenanceRequest.countDocuments({
        createdAt: { $gte: todayStart, $lt: todayEnd },
      }),

      // Active bookings (Upcoming or Ongoing)
      Booking.countDocuments({
        status: { $in: [BOOKING_STATUS.UPCOMING, BOOKING_STATUS.ONGOING] },
      }),

      // Pending transfer requests
      TransferRequest.countDocuments({ status: TRANSFER_STATUS.REQUESTED }),

      // Upcoming returns: active allocations with expectedReturnDate in next 7 days (and not overdue)
      Allocation.countDocuments({
        status: ALLOCATION_STATUS.ACTIVE,
        expectedReturnDate: { $gte: now, $lte: sevenDaysFromNow },
      }),

      // Overdue returns: active allocations with expectedReturnDate in the past
      Allocation.countDocuments({
        status: ALLOCATION_STATUS.ACTIVE,
        expectedReturnDate: { $lt: now },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        assetsAvailable,
        assetsAllocated,
        maintenanceToday,
        activeBookings,
        pendingTransfers,
        upcomingReturns,
        overdueReturns,
      },
      message: 'Dashboard KPIs fetched.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
