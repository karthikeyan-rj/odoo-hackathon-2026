const express = require('express');
const Department = require('../models/Department');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/enums');

const router = express.Router();

// All routes require auth
router.use(requireAuth);

// ── GET /api/departments ───────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const departments = await Department.find(filter)
      .populate('head', 'name email role')
      .populate('parentDepartment', 'name');

    return res.status(200).json({
      success: true,
      data: departments,
      message: 'Departments fetched.',
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/departments ──────────────────────────────────────────────────────
router.post('/', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { name, head, parentDepartment } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, data: null, message: 'name is required.' });
    }

    const dept = await Department.create({ name, head, parentDepartment });
    return res.status(201).json({ success: true, data: dept, message: 'Department created.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, data: null, message: 'Department name already exists.' });
    }
    next(err);
  }
});

// ── PUT /api/departments/:id ───────────────────────────────────────────────────
router.put('/:id', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { name, head, parentDepartment } = req.body;
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { name, head, parentDepartment },
      { new: true, runValidators: true }
    ).populate('head', 'name email');

    if (!dept) {
      return res.status(404).json({ success: false, data: null, message: 'Department not found.' });
    }
    return res.status(200).json({ success: true, data: dept, message: 'Department updated.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/departments/:id/status ─────────────────────────────────────────
router.patch('/:id/status', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, data: null, message: 'status must be Active or Inactive.' });
    }
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!dept) {
      return res.status(404).json({ success: false, data: null, message: 'Department not found.' });
    }
    return res.status(200).json({ success: true, data: dept, message: `Department ${status.toLowerCase()}.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
