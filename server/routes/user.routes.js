const express = require('express');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/enums');

const router = express.Router();

router.use(requireAuth);

// ── GET /api/users — Employee directory ───────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    const users = await User.find(filter)
      .select('-passwordHash')
      .populate('department', 'name');

    return res.status(200).json({ success: true, data: users, message: 'Users fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/users/:id/role — Admin promotes user role ─────────────────────
router.patch(
  '/:id/role',
  requireRole(ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const { role } = req.body;
      const allowedPromotions = [ROLES.EMPLOYEE, ROLES.DEPARTMENT_HEAD, ROLES.ASSET_MANAGER, ROLES.ADMIN];
      if (!role || !allowedPromotions.includes(role)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: `role must be one of: ${allowedPromotions.join(', ')}.`,
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          role,
          roleAssignedBy: req.user._id,
          roleAssignedAt: new Date(),
        },
        { new: true }
      ).select('-passwordHash');

      if (!user) {
        return res.status(404).json({ success: false, data: null, message: 'User not found.' });
      }

      return res.status(200).json({ success: true, data: user, message: `User promoted to ${role}.` });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/users/:id/status — Admin activate/deactivate ─────────────────
router.patch(
  '/:id/status',
  requireRole(ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ success: false, data: null, message: 'status must be Active or Inactive.' });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).select('-passwordHash');

      if (!user) {
        return res.status(404).json({ success: false, data: null, message: 'User not found.' });
      }

      return res.status(200).json({ success: true, data: user, message: `User ${status.toLowerCase()}.` });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
