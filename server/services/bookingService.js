const Booking = require("../models/Booking");
const Asset = require("../models/Asset");

/**
 * Check whether a proposed booking overlaps with any existing
 * non-cancelled booking for the same resource.
 *
 * Overlap condition:
 *   existing.startTime < requestedEndTime
 *   AND existing.endTime > requestedStartTime
 *   AND existing.status ≠ "Cancelled"
 *
 * A booking beginning exactly when another ends is allowed
 * (uses strict < / > not <= / >=).
 *
 * @param {Object} params
 * @param {string} params.resourceId
 * @param {Date}   params.startTime
 * @param {Date}   params.endTime
 * @param {string} [params.excludeBookingId]  Ignore this booking (for reschedule).
 * @returns {Promise<boolean>} true if there IS an overlap.
 */
async function checkBookingOverlap({
  resourceId,
  startTime,
  endTime,
  excludeBookingId,
}) {
  const filter = {
    resource: resourceId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: { $ne: "Cancelled" },
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(filter).lean();
  return !!conflict;
}

/**
 * Create a booking after verifying the resource is bookable and there
 * is no time overlap.
 *
 * @param {Object} params
 * @param {string} params.resourceId
 * @param {string} params.requestedBy
 * @param {string} [params.bookedForDepartment]
 * @param {string} [params.purpose]
 * @param {Date}   params.startTime
 * @param {Date}   params.endTime
 * @returns {Promise<Object>} The created booking document.
 */
async function createBooking({
  resourceId,
  requestedBy,
  bookedForDepartment,
  purpose,
  startTime,
  endTime,
}) {
  // Verify the asset is bookable
  const asset = await Asset.findById(resourceId);

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (!asset.isBookable) {
    throw new Error("This asset is not bookable");
  }

  // Check for overlap
  const hasOverlap = await checkBookingOverlap({
    resourceId,
    startTime,
    endTime,
  });

  if (hasOverlap) {
    throw new Error(
      "Booking overlaps with an existing booking"
    );
  }

  return Booking.create({
    resource: resourceId,
    requestedBy,
    bookedForDepartment: bookedForDepartment || null,
    purpose: purpose || "",
    startTime,
    endTime,
  });
}

module.exports = {
  checkBookingOverlap,
  createBooking,
};
