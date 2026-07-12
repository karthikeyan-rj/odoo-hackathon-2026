const express = require('express');
const AssetCategory = require('../models/AssetCategory');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/enums');

const router = express.Router();

router.use(requireAuth);

// ── GET /api/asset-categories ─────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const categories = await AssetCategory.find(filter);
    return res.status(200).json({ success: true, data: categories, message: 'Categories fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/asset-categories/:id ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const cat = await AssetCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, data: null, message: 'Category not found.' });
    return res.status(200).json({ success: true, data: cat, message: 'Category fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/asset-categories ─────────────────────────────────────────────────
router.post('/', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, data: null, message: 'name is required.' });
    const cat = await AssetCategory.create({ name, description });
    return res.status(201).json({ success: true, data: cat, message: 'Category created.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, data: null, message: 'Category name already exists.' });
    }
    next(err);
  }
});

// ── PUT /api/asset-categories/:id ─────────────────────────────────────────────
router.put('/:id', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const cat = await AssetCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, status },
      { new: true, runValidators: true }
    );
    if (!cat) return res.status(404).json({ success: false, data: null, message: 'Category not found.' });
    return res.status(200).json({ success: true, data: cat, message: 'Category updated.' });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/asset-categories/:id ──────────────────────────────────────────
router.delete('/:id', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const cat = await AssetCategory.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ success: false, data: null, message: 'Category not found.' });
    return res.status(200).json({ success: true, data: null, message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
