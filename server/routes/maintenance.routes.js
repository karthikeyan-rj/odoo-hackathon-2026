const express = require('express');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/enums');
const {
  raiseRequest,
  approveRequest,
  rejectRequest,
  assignTechnician,
  markInProgress,
  resolveRequest,
} = require('../services/maintenance.service');

const router = express.Router();
router.use(requireAuth);

// ── POST /api/maintenance ─────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { assetId, description, priority, attachmentUrl } = req.body;
    if (!assetId || !description) {
      return res.status(400).json({ success: false, data: null, message: 'assetId and description are required.' });
    }
    const request = await raiseRequest({ assetId, raisedBy: req.user._id, description, priority, attachmentUrl });
    return res.status(201).json({ success: true, data: request, message: 'Maintenance request raised.' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/maintenance ──────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.asset) filter.asset = req.query.asset;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const requests = await MaintenanceRequest.find(filter)
      .populate('asset', 'assetTag name')
      .populate('raisedBy', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: requests, message: 'Maintenance requests fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/maintenance/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const req_ = await MaintenanceRequest.findById(req.params.id)
      .populate('asset', 'assetTag name status')
      .populate('raisedBy', 'name email')
      .populate('approvedBy', 'name');
    if (!req_) return res.status(404).json({ success: false, data: null, message: 'Not found.' });
    return res.status(200).json({ success: true, data: req_, message: 'Fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/maintenance/:id/approve ───────────────────────────────────────
router.patch('/:id/approve', requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const result = await approveRequest({ requestId: req.params.id, approvedBy: req.user._id });
    return res.status(200).json({ success: true, data: result, message: 'Maintenance request approved.' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ success: false, data: null, message: err.message });
    next(err);
  }
});

// ── PATCH /api/maintenance/:id/reject ────────────────────────────────────────
router.patch('/:id/reject', requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const result = await rejectRequest({ requestId: req.params.id, approvedBy: req.user._id });
    return res.status(200).json({ success: true, data: result, message: 'Maintenance request rejected.' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ success: false, data: null, message: err.message });
    next(err);
  }
});

// ── PATCH /api/maintenance/:id/assign-technician ─────────────────────────────
router.patch('/:id/assign-technician', requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { technicianName } = req.body;
    if (!technicianName) return res.status(400).json({ success: false, data: null, message: 'technicianName is required.' });
    const result = await assignTechnician({ requestId: req.params.id, technicianName });
    return res.status(200).json({ success: true, data: result, message: 'Technician assigned.' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ success: false, data: null, message: err.message });
    next(err);
  }
});

// ── PATCH /api/maintenance/:id/in-progress ───────────────────────────────────
router.patch('/:id/in-progress', requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const result = await markInProgress({ requestId: req.params.id });
    return res.status(200).json({ success: true, data: result, message: 'Maintenance in progress.' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ success: false, data: null, message: err.message });
    next(err);
  }
});

// ── PATCH /api/maintenance/:id/resolve ───────────────────────────────────────
router.patch('/:id/resolve', requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const result = await resolveRequest({ requestId: req.params.id });
    return res.status(200).json({ success: true, data: result, message: 'Maintenance resolved. Asset back to Available.' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ success: false, data: null, message: err.message });
    next(err);
  }
});

module.exports = router;
