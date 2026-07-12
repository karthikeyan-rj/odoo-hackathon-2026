const express = require('express');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/TransferRequest');
const ActivityLog = require('../models/ActivityLog');
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

// ── GET /api/dashboard/utilization ────────────────────────────────────────────
// Asset count grouped by status, for the Asset Utilization donut chart.
router.get('/utilization', async (req, res, next) => {
  try {
    const rows = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus = Object.values(ASSET_STATUS).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});
    rows.forEach((r) => {
      if (r._id in byStatus) byStatus[r._id] = r.count;
    });

    const data = Object.entries(byStatus).map(([status, count]) => ({ status, count }));

    return res.status(200).json({ success: true, data, message: 'Asset utilization fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/maintenance-summary ────────────────────────────────────
// MaintenanceRequest count grouped by status, for the Maintenance Bottlenecks chart.
router.get('/maintenance-summary', async (req, res, next) => {
  try {
    const rows = await MaintenanceRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus = Object.values(MAINTENANCE_STATUS).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});
    rows.forEach((r) => {
      if (r._id in byStatus) byStatus[r._id] = r.count;
    });

    const data = Object.entries(byStatus).map(([status, count]) => ({ status, count }));

    return res.status(200).json({ success: true, data, message: 'Maintenance summary fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/recent-activity ────────────────────────────────────────
// Last 10 ActivityLog entries, for the live Recent Activity timeline.
router.get('/recent-activity', async (req, res, next) => {
  try {
    const entries = await ActivityLog.find({})
      .populate('actor', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({ success: true, data: entries, message: 'Recent activity fetched.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
