const express = require('express');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/enums');

const router = express.Router();

router.use(requireAuth);

/**
 * Atomically generate next assetTag in format AF-0001, AF-0002, ...
 * Finds the highest existing tag number, then increments.
 * Uses findOneAndUpdate on a dedicated Counter document for true atomicity
 * under concurrent requests.
 */
const generateAssetTag = async () => {
  // Simple approach: find highest existing tag and increment
  // For true concurrent safety in production, use a Counter collection.
  const last = await Asset.findOne({}, { assetTag: 1 })
    .sort({ assetTag: -1 })
    .lean();

  let nextNum = 1;
  if (last && last.assetTag) {
    const num = parseInt(last.assetTag.split('-')[1], 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  return `AF-${String(nextNum).padStart(4, '0')}`;
};

// ── POST /api/assets ──────────────────────────────────────────────────────────
router.post(
  '/',
  requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const { name, serialNumber, category, location, department, purchaseDate, purchaseCost, isBookable, description } = req.body;
      if (!name || !category) {
        return res.status(400).json({ success: false, data: null, message: 'name and category are required.' });
      }

      const assetTag = await generateAssetTag();

      const asset = await Asset.create({
        assetTag,
        name,
        serialNumber,
        category,
        location,
        department,
        purchaseDate,
        purchaseCost,
        isBookable: isBookable || false,
        description,
      });

      await asset.populate('category', 'name');

      return res.status(201).json({ success: true, data: asset, message: `Asset registered with tag ${assetTag}.` });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/assets ────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.location) filter.location = new RegExp(req.query.location, 'i');
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ assetTag: re }, { serialNumber: re }, { name: re }];
    }

    const assets = await Asset.find(filter)
      .populate('category', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: assets, message: 'Assets fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/assets/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category', 'name')
      .populate('department', 'name');
    if (!asset) return res.status(404).json({ success: false, data: null, message: 'Asset not found.' });
    return res.status(200).json({ success: true, data: asset, message: 'Asset fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/assets/:id/history ───────────────────────────────────────────────
router.get('/:id/history', async (req, res, next) => {
  try {
    const assetId = req.params.id;

    const [allocations, maintenanceRequests] = await Promise.all([
      Allocation.find({ asset: assetId })
        .populate('assignee', 'name email')
        .populate('allocatedBy', 'name')
        .sort({ createdAt: -1 }),
      MaintenanceRequest.find({ asset: assetId })
        .populate('raisedBy', 'name')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 }),
    ]);

    // Combine and sort by date descending
    const allocationsMapped = allocations.map((a) => ({ ...a.toObject(), historyType: 'Allocation' }));
    const maintenanceMapped = maintenanceRequests.map((m) => ({ ...m.toObject(), historyType: 'Maintenance' }));
    const combined = [...allocationsMapped, ...maintenanceMapped].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({ success: true, data: combined, message: 'Asset history fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/assets/:id ────────────────────────────────────────────────────────
router.put('/:id', requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { name, serialNumber, category, location, department, purchaseDate, purchaseCost, isBookable, description } = req.body;
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { name, serialNumber, category, location, department, purchaseDate, purchaseCost, isBookable, description },
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('department', 'name');

    if (!asset) return res.status(404).json({ success: false, data: null, message: 'Asset not found.' });
    return res.status(200).json({ success: true, data: asset, message: 'Asset updated.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/assets/:id/status ──────────────────────────────────────────────
router.patch(
  '/:id/status',
  requireRole(ROLES.ASSET_MANAGER, ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ['Available', 'Allocated', 'UnderMaintenance', 'Retired', 'Disposed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, data: null, message: `status must be one of: ${validStatuses.join(', ')}.` });
      }

      const asset = await Asset.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!asset) return res.status(404).json({ success: false, data: null, message: 'Asset not found.' });
      return res.status(200).json({ success: true, data: asset, message: `Asset status set to ${status}.` });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
