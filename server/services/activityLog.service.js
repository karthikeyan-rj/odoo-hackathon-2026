const ActivityLog = require("../models/ActivityLog");

/**
 * Log an activity in the database.
 * @param {Object} params
 * @param {string} [params.actor] User _id
 * @param {string} params.action Description of action (e.g. "Asset Registered")
 * @param {string} params.entityType Entity type (e.g. "Asset", "Allocation")
 * @param {string} [params.entityId] Entity ID
 * @param {Object} [params.details] Additional metadata
 */
async function logActivity({ actor, action, entityType, entityId, details }) {
  try {
    const log = new ActivityLog({
      actor: actor || null,
      action,
      entityType,
      entityId: entityId || null,
      details: details || {},
    });
    await log.save();
    return log;
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
}

module.exports = { logActivity };
