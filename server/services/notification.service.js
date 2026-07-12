const Notification = require('../models/Notification');

/**
 * notify — create a notification for a user.
 * Called from services on key events. Returns a promise so callers can
 * fire-and-forget with .catch(() => {}) without blocking main operations.
 */
const notify = async ({ userId, type, message, entityType = null, entityId = null }) => {
  return Notification.create({ user: userId, type, message, entityType, entityId });
};

module.exports = { notify };
