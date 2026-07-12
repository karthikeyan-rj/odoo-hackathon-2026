const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/enums');
const Allocation = require('../models/Allocation');
const TransferRequest = require('../models/TransferRequest');
const {
  allocateAsset,
  returnAsset,
  createTransferRequest,
  approveTransfer,
  rejectTransfer,
} = require('../services/allocation.service');

const router = express.Router();
router.use(requireAuth);

// ── POST /api/allocations ─────────────────────────────────────────────────────
router.post('/', requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { assetId, assigneeType, assigneeId, expectedReturnDate } = req.body;
    if (!assetId || !assigneeType || !assigneeId) {
      return res.status(400).json({ success: false, data: null, message: 'assetId, assigneeType, assigneeId are required.' });
    }

    const allocation = await allocateAsset({
      assetId,
      assigneeType,
      assigneeId,
      allocatedBy: req.user._id,
      expectedReturnDate,
    });

    return res.status(201).json({ success: true, data: allocation, message: 'Asset allocated successfully.' });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({
        success: false,
        data: { holderInfo: err.holderInfo || null },
        message: err.message,
      });
    }
    next(err);
  }
});

// ── POST /api/allocations/:id/return ─────────────────────────────────────────
router.post('/:id/return', requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const allocation = await returnAsset({
      allocationId: req.params.id,
      conditionNotes: req.body.conditionNotes,
      returnedBy: req.user._id,
    });
    return res.status(200).json({ success: true, data: allocation, message: 'Asset returned successfully.' });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, data: null, message: err.message });
    }
    next(err);
  }
});

// ── GET /api/allocations ──────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.asset) filter.asset = req.query.asset;
    if (req.query.assignee) filter.assignee = req.query.assignee;
    if (req.query.status) filter.status = req.query.status;

    const allocations = await Allocation.find(filter)
      .populate('asset', 'assetTag name')
      .populate('assignee', 'name email')
      .populate('allocatedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: allocations, message: 'Allocations fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/transfer-requests ───────────────────────────────────────────────
router.post('/transfer-requests', async (req, res, next) => {
  try {
    const { assetId, targetType, targetId, reason } = req.body;
    if (!assetId || !targetType || !targetId) {
      return res.status(400).json({ success: false, data: null, message: 'assetId, targetType, targetId are required.' });
    }

    const transferRequest = await createTransferRequest({
      assetId,
      requestedBy: req.user._id,
      targetType,
      targetId,
      reason,
    });

    return res.status(201).json({ success: true, data: transferRequest, message: 'Transfer request created.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/transfer-requests/:id/approve ──────────────────────────────────
router.patch(
  '/transfer-requests/:id/approve',
  requireRole(ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const result = await approveTransfer({
        transferRequestId: req.params.id,
        approvedBy: req.user._id,
      });
      return res.status(200).json({ success: true, data: result, message: 'Transfer approved.' });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ success: false, data: null, message: err.message });
      }
      next(err);
    }
  }
);

// ── PATCH /api/transfer-requests/:id/reject ───────────────────────────────────
router.patch(
  '/transfer-requests/:id/reject',
  requireRole(ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const result = await rejectTransfer({
        transferRequestId: req.params.id,
        reviewedBy: req.user._id,
      });
      return res.status(200).json({ success: true, data: result, message: 'Transfer rejected.' });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ success: false, data: null, message: err.message });
      }
      next(err);
    }
  }
);

// ── GET /api/transfer-requests ────────────────────────────────────────────────
router.get('/transfer-requests', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.asset) filter.asset = req.query.asset;

    const requests = await TransferRequest.find(filter)
      .populate('asset', 'assetTag name')
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: requests, message: 'Transfer requests fetched.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
