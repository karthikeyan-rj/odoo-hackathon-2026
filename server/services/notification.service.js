const Notification = require('../models/Notification');

async function createNotification({ userId, type, message, entityType = '', entityId = null }) {
  if (!userId) return null;

  const notification = await Notification.create({
    user: userId,
    type,
    message,
    entityType,
    entityId,
  });

  return notification;
}

module.exports = { createNotification };
