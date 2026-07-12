const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

// ── GET /api/notifications ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.read === 'true') filter.isRead = true;
    if (req.query.read === 'false') filter.isRead = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: notifications, message: 'Notifications fetched.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
// Must be before /:id to avoid routing conflict
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    return res.status(200).json({ success: true, data: null, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, data: null, message: 'Notification not found.' });
    }
    return res.status(200).json({ success: true, data: notification, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
