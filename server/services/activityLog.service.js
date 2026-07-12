const ActivityLog = require('../models/ActivityLog');

/**
 * logActivity — fire-and-forget activity logger.
 * Call from any write operation. Never throws — failures are silently caught.
 *
 * @param {Object} params
 * @param {ObjectId} params.actor   - User performing the action
 * @param {string}   params.action  - Human-readable action (e.g., "ALLOCATE_ASSET")
 * @param {string}   [params.entityType] - e.g., "Asset", "Allocation"
 * @param {ObjectId} [params.entityId]
 * @param {Object}   [params.details]   - Any extra context
 */
const logActivity = async ({ actor, action, entityType, entityId, details }) => {
  try {
    await ActivityLog.create({ actor, action, entityType, entityId, details });
  } catch (err) {
    console.error('[ActivityLog] Failed to write log:', err.message);
  }
};

module.exports = { logActivity };
