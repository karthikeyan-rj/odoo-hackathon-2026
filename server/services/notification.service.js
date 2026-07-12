const Notification = require('../models/Notification');
const socketStore = require('../config/socket');

/**
 * notify — create a notification for a user and emit via socket.
 * Called from services on key events. Returns a promise so callers can
 * fire-and-forget with .catch(() => {}) without blocking main operations.
 */
const notify = async ({ userId, type, message, entityType = null, entityId = null }) => {
  const notification = await Notification.create({ user: userId, type, message, entityType, entityId });
  // Emit to the specific user's room
  try {
    socketStore.getIO().to(`user:${userId}`).emit('notification:new', { notification });
  } catch (_) {}
  return notification;
};

module.exports = { notify };
