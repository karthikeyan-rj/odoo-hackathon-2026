const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const { BOOKING_STATUS } = require('../constants/enums');
const { notify } = require('./notification.service');
const { NOTIFICATION_TYPE, ENTITY_TYPE } = require('../constants/enums');
const socketStore = require('../config/socket');

const emitSafe = (event, data) => {
  try { socketStore.getIO().to('broadcast').emit(event, data); } catch (_) {}
};

/**
 * checkOverlap — returns true if any booking overlaps the given time window
 * for the given resource, excluding a specific booking (for reschedule).
 */
const checkOverlap = async ({ resourceId, startTime, endTime, excludeBookingId = null }) => {
  const query = {
    resource: resourceId,
    status: { $ne: BOOKING_STATUS.CANCELLED },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const count = await Booking.countDocuments(query);
  return count > 0;
};

/**
 * createBooking — checks overlap and isBookable, then creates booking
 */
const createBooking = async ({ resourceId, requestedBy, startTime, endTime, purpose }) => {
  const asset = await Asset.findById(resourceId);
  if (!asset) {
    const err = new Error('Resource asset not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!asset.isBookable) {
    const err = new Error('This asset is not bookable.');
    err.statusCode = 400;
    throw err;
  }

  const overlap = await checkOverlap({ resourceId, startTime, endTime });
  if (overlap) {
    const err = new Error('Booking overlaps with an existing booking for this resource.');
    err.statusCode = 409;
    throw err;
  }

  const booking = await Booking.create({
    resource: resourceId,
    requestedBy,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    purpose,
    status: BOOKING_STATUS.UPCOMING,
  });

  await booking.populate([
    { path: 'resource', select: 'assetTag name' },
    { path: 'requestedBy', select: 'name email' },
  ]);

  notify({
    userId: requestedBy,
    type: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
    message: `Booking confirmed for ${asset.name} from ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}.`,
    entityType: ENTITY_TYPE.BOOKING,
    entityId: booking._id,
  }).catch(() => {});

  emitSafe('booking:created', { booking });
  return booking;
};

/**
 * cancelBooking — cancel a booking
 */
const cancelBooking = async (bookingId) => {
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, status: { $ne: BOOKING_STATUS.CANCELLED } },
    { $set: { status: BOOKING_STATUS.CANCELLED } },
    { new: true }
  );

  if (!booking) {
    const err = new Error('Booking not found or already cancelled.');
    err.statusCode = 404;
    throw err;
  }

  notify({
    userId: booking.requestedBy,
    type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
    message: `Your booking has been cancelled.`,
    entityType: ENTITY_TYPE.BOOKING,
    entityId: booking._id,
  }).catch(() => {});

  emitSafe('booking:cancelled', { bookingId: booking._id });
  return booking;
};

/**
 * rescheduleBooking — re-check overlap excluding itself, then update times
 */
const rescheduleBooking = async ({ bookingId, newStart, newEnd }) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found.');
    err.statusCode = 404;
    throw err;
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    const err = new Error('Cannot reschedule a cancelled booking.');
    err.statusCode = 400;
    throw err;
  }

  const overlap = await checkOverlap({
    resourceId: booking.resource,
    startTime: newStart,
    endTime: newEnd,
    excludeBookingId: bookingId,
  });

  if (overlap) {
    const err = new Error('New time slot overlaps with an existing booking.');
    err.statusCode = 409;
    throw err;
  }

  booking.startTime = new Date(newStart);
  booking.endTime = new Date(newEnd);
  await booking.save();

  return booking;
};

module.exports = { checkOverlap, createBooking, cancelBooking, rescheduleBooking };
