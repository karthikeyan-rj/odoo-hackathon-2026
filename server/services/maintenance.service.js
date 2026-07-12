const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const { MAINTENANCE_STATUS, ASSET_STATUS } = require('../constants/enums');
const { notify } = require('./notification.service');
const { NOTIFICATION_TYPE, ENTITY_TYPE } = require('../constants/enums');
const socketStore = require('../config/socket');
const { logActivity } = require('./activityLog.service');

const emitSafe = (event, data) => {
  try { socketStore.getIO().to('broadcast').emit(event, data); } catch (_) {}
};

const raiseRequest = async ({ assetId, raisedBy, description, priority, attachmentUrl }) => {
  const request = await MaintenanceRequest.create({
    asset: assetId,
    raisedBy,
    description,
    priority,
    attachmentUrl,
    status: MAINTENANCE_STATUS.PENDING,
  });
  await request.populate([
    { path: 'asset', select: 'assetTag name' },
    { path: 'raisedBy', select: 'name email' },
  ]);

  logActivity({
    actor: raisedBy,
    action: 'RAISE_MAINTENANCE_REQUEST',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    details: { assetTag: request.asset?.assetTag, priority },
  }).catch(() => {});

  return request;
};

const approveRequest = async ({ requestId, approvedBy }) => {
  const request = await MaintenanceRequest.findOneAndUpdate(
    { _id: requestId, status: MAINTENANCE_STATUS.PENDING },
    { $set: { status: MAINTENANCE_STATUS.APPROVED, approvedBy } },
    { new: true }
  ).populate('asset raisedBy');

  if (!request) {
    const err = new Error('Maintenance request not found or not in Pending state.');
    err.statusCode = 404;
    throw err;
  }

  // Set asset to UnderMaintenance
  await Asset.findByIdAndUpdate(request.asset._id, { status: ASSET_STATUS.UNDER_MAINTENANCE });

  notify({
    userId: request.raisedBy._id,
    type: NOTIFICATION_TYPE.MAINTENANCE_APPROVED,
    message: `Your maintenance request for ${request.asset.assetTag} has been approved.`,
    entityType: ENTITY_TYPE.MAINTENANCE_REQUEST,
    entityId: request._id,
  }).catch(() => {});

  logActivity({
    actor: approvedBy,
    action: 'APPROVE_MAINTENANCE_REQUEST',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    details: { assetTag: request.asset?.assetTag },
  }).catch(() => {});

  emitSafe('maintenance:statusChanged', { requestId, status: MAINTENANCE_STATUS.APPROVED });
  return request;
};

const rejectRequest = async ({ requestId, approvedBy }) => {
  const request = await MaintenanceRequest.findOneAndUpdate(
    { _id: requestId, status: MAINTENANCE_STATUS.PENDING },
    { $set: { status: MAINTENANCE_STATUS.REJECTED, approvedBy } },
    { new: true }
  ).populate('asset raisedBy');

  if (!request) {
    const err = new Error('Maintenance request not found or not in Pending state.');
    err.statusCode = 404;
    throw err;
  }

  notify({
    userId: request.raisedBy._id,
    type: NOTIFICATION_TYPE.MAINTENANCE_REJECTED,
    message: `Your maintenance request for ${request.asset.assetTag} has been rejected.`,
    entityType: ENTITY_TYPE.MAINTENANCE_REQUEST,
    entityId: request._id,
  }).catch(() => {});

  logActivity({
    actor: approvedBy,
    action: 'REJECT_MAINTENANCE_REQUEST',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    details: { assetTag: request.asset?.assetTag },
  }).catch(() => {});

  emitSafe('maintenance:statusChanged', { requestId, status: MAINTENANCE_STATUS.REJECTED });
  return request;
};

const assignTechnician = async ({ requestId, technicianName }) => {
  const request = await MaintenanceRequest.findOneAndUpdate(
    { _id: requestId, status: MAINTENANCE_STATUS.APPROVED },
    { $set: { status: MAINTENANCE_STATUS.TECHNICIAN_ASSIGNED, technicianName } },
    { new: true }
  );

  if (!request) {
    const err = new Error('Maintenance request not found or not in Approved state.');
    err.statusCode = 404;
    throw err;
  }
  emitSafe('maintenance:statusChanged', { requestId, status: MAINTENANCE_STATUS.TECHNICIAN_ASSIGNED });
  return request;
};

const markInProgress = async ({ requestId }) => {
  const request = await MaintenanceRequest.findOneAndUpdate(
    { _id: requestId, status: MAINTENANCE_STATUS.TECHNICIAN_ASSIGNED },
    { $set: { status: MAINTENANCE_STATUS.IN_PROGRESS } },
    { new: true }
  );

  if (!request) {
    const err = new Error('Maintenance request not found or not in TechnicianAssigned state.');
    err.statusCode = 404;
    throw err;
  }
  emitSafe('maintenance:statusChanged', { requestId, status: MAINTENANCE_STATUS.IN_PROGRESS });
  return request;
};

const resolveRequest = async ({ requestId }) => {
  const request = await MaintenanceRequest.findOneAndUpdate(
    { _id: requestId, status: MAINTENANCE_STATUS.IN_PROGRESS },
    { $set: { status: MAINTENANCE_STATUS.RESOLVED, resolvedAt: new Date() } },
    { new: true }
  ).populate('asset');

  if (!request) {
    const err = new Error('Maintenance request not found or not InProgress.');
    err.statusCode = 404;
    throw err;
  }

  // Only restore to Available if not Retired/Disposed
  const safeStatuses = [ASSET_STATUS.UNDER_MAINTENANCE];
  const asset = await Asset.findById(request.asset._id);
  if (asset && safeStatuses.includes(asset.status)) {
    await Asset.findByIdAndUpdate(request.asset._id, { status: ASSET_STATUS.AVAILABLE });
  }

  if (request.approvedBy) {
    logActivity({
      actor: request.approvedBy,
      action: 'RESOLVE_MAINTENANCE_REQUEST',
      entityType: 'MaintenanceRequest',
      entityId: request._id,
      details: { assetTag: request.asset?.assetTag },
    }).catch(() => {});
  }

  emitSafe('maintenance:statusChanged', { requestId, status: MAINTENANCE_STATUS.RESOLVED });
  return request;
};

module.exports = { raiseRequest, approveRequest, rejectRequest, assignTechnician, markInProgress, resolveRequest };
