
const Asset = require('../models/Asset');
const socketStore = require('../config/socket');

const emitSafe = (event, data) => {
  try { socketStore.getIO().to('broadcast').emit(event, data); } catch (_) {}
};
const Allocation = require('../models/Allocation');
const TransferRequest = require('../models/TransferRequest');
const { ASSET_STATUS, ALLOCATION_STATUS, TRANSFER_STATUS } = require('../constants/enums');
const { notify } = require('./notification.service');
const { NOTIFICATION_TYPE, ENTITY_TYPE } = require('../constants/enums');
const { logActivity } = require('./activityLog.service');

/**
 * allocateAsset — atomically allocate an asset to a user or department.
 * Uses findOneAndUpdate with precondition { status: "Available" } to prevent
 * race conditions. Defense-in-depth via partial unique index on Allocation.
 */
const allocateAsset = async ({ assetId, assigneeType, assigneeId, allocatedBy, expectedReturnDate }) => {
  // Step 1: Atomic status flip — only succeeds if currently Available
  const asset = await Asset.findOneAndUpdate(
    { _id: assetId, status: ASSET_STATUS.AVAILABLE },
    { $set: { status: ASSET_STATUS.ALLOCATED } },
    { new: true }
  );

  if (!asset) {
    // Asset not available — find out who holds it
    const existing = await Allocation.findOne({ asset: assetId, status: ALLOCATION_STATUS.ACTIVE })
      .populate('assignee', 'name email');

    const holderInfo = existing
      ? { holderId: existing.assignee?._id, holderName: existing.assignee?.name || 'Unknown' }
      : null;

    const err = new Error(
      holderInfo
        ? `Asset is not available. Currently held by ${holderInfo.holderName}.`
        : 'Asset is not available.'
    );
    err.statusCode = 409;
    err.holderInfo = holderInfo;
    throw err;
  }

  // Step 2: Create allocation record
  const allocation = await Allocation.create({
    asset: assetId,
    assigneeType,
    assignee: assigneeId,
    allocatedBy,
    status: ALLOCATION_STATUS.ACTIVE,
    expectedReturnDate: expectedReturnDate || null,
  });

  await allocation.populate([
    { path: 'asset', select: 'assetTag name' },
    { path: 'assignee', select: 'name email' },
    { path: 'allocatedBy', select: 'name' },
  ]);

  // Notify assignee (fire-and-forget)
  if (assigneeType === 'User') {
    notify({
      userId: assigneeId,
      type: NOTIFICATION_TYPE.ASSET_ALLOCATED,
      message: `Asset ${asset.assetTag} (${asset.name}) has been allocated to you.`,
      entityType: ENTITY_TYPE.ALLOCATION,
      entityId: allocation._id,
    }).catch(() => {});
  }

  logActivity({
    actor: allocatedBy,
    action: 'ALLOCATE_ASSET',
    entityType: 'Allocation',
    entityId: allocation._id,
    details: { assetTag: asset.assetTag, assetName: asset.name },
  }).catch(() => {});

  emitSafe('allocation:created', { allocation });
  return allocation;
};

/**
 * returnAsset — mark allocation as Returned, set asset back to Available
 */
const returnAsset = async ({ allocationId, conditionNotes, returnedBy }) => {
  const allocation = await Allocation.findOne({ _id: allocationId, status: ALLOCATION_STATUS.ACTIVE });
  if (!allocation) {
    const err = new Error('Active allocation not found.');
    err.statusCode = 404;
    throw err;
  }

  allocation.status = ALLOCATION_STATUS.RETURNED;
  allocation.returnedAt = new Date();
  allocation.returnConditionNotes = conditionNotes || '';
  await allocation.save();

  await Asset.findByIdAndUpdate(allocation.asset, { status: ASSET_STATUS.AVAILABLE });

  logActivity({
    actor: returnedBy,
    action: 'RETURN_ASSET',
    entityType: 'Allocation',
    entityId: allocation._id,
  }).catch(() => {});

  emitSafe('allocation:returned', { allocationId: allocation._id, assetId: allocation.asset });
  return allocation;
};

/**
 * createTransferRequest — raise a transfer request
 */
const createTransferRequest = async ({ assetId, requestedBy, targetType, targetId, reason }) => {
  const transferRequest = await TransferRequest.create({
    asset: assetId,
    requestedBy,
    targetType,
    targetId,
    reason,
    status: TRANSFER_STATUS.REQUESTED,
  });

  await transferRequest.populate([
    { path: 'asset', select: 'assetTag name' },
    { path: 'requestedBy', select: 'name email' },
  ]);

  logActivity({
    actor: requestedBy,
    action: 'REQUEST_TRANSFER',
    entityType: 'TransferRequest',
    entityId: transferRequest._id,
    details: { assetTag: transferRequest.asset?.assetTag },
  }).catch(() => {});

  emitSafe('transfer:requested', { transferRequest });
  return transferRequest;
};

/**
 * approveTransfer — approve a transfer request.
 *
 * Uses sequential writes (no session) for compatibility with standalone MongoDB.
 * ATOMICITY RISK: If a failure occurs between step 2 and 3, the asset will have
 * no active allocation. For production, run MongoDB as a replica set and re-enable
 * the session/transaction path.
 */
const approveTransfer = async ({ transferRequestId, approvedBy }) => {
  const transferRequest = await TransferRequest.findOne({
    _id: transferRequestId,
    status: TRANSFER_STATUS.REQUESTED,
  });

  if (!transferRequest) {
    const err = new Error('Transfer request not found or already processed.');
    err.statusCode = 404;
    throw err;
  }

  // 1. Mark TransferRequest approved
  transferRequest.status = TRANSFER_STATUS.APPROVED;
  transferRequest.reviewedBy = approvedBy;
  transferRequest.reviewedAt = new Date();
  await transferRequest.save();

  // 2. Close old allocation
  const oldAllocation = await Allocation.findOneAndUpdate(
    { asset: transferRequest.asset, status: ALLOCATION_STATUS.ACTIVE },
    { $set: { status: ALLOCATION_STATUS.TRANSFERRED, returnedAt: new Date() } },
    { new: true }
  );

  // 3. Create new allocation for target
  const newAllocation = await Allocation.create({
    asset: transferRequest.asset,
    assigneeType: transferRequest.targetType,
    assignee: transferRequest.targetId,
    allocatedBy: approvedBy,
    status: ALLOCATION_STATUS.ACTIVE,
  });

  const result = { transferRequest, oldAllocation, newAllocation };

  // Notify target (fire-and-forget)
  if (transferRequest.targetType === 'User') {
    notify({
      userId: transferRequest.targetId,
      type: NOTIFICATION_TYPE.TRANSFER_APPROVED,
      message: `Transfer approved. Asset has been allocated to you.`,
      entityType: ENTITY_TYPE.TRANSFER_REQUEST,
      entityId: transferRequest._id,
    }).catch(() => {});
  }

  logActivity({
    actor: approvedBy,
    action: 'APPROVE_TRANSFER',
    entityType: 'TransferRequest',
    entityId: transferRequest._id,
  }).catch(() => {});

  emitSafe('transfer:approved', { result });
  return result;
};

/**
 * rejectTransfer — reject a transfer request
 */
const rejectTransfer = async ({ transferRequestId, reviewedBy }) => {
  const transferRequest = await TransferRequest.findOneAndUpdate(
    { _id: transferRequestId, status: TRANSFER_STATUS.REQUESTED },
    { $set: { status: TRANSFER_STATUS.REJECTED, reviewedBy, reviewedAt: new Date() } },
    { new: true }
  );

  if (!transferRequest) {
    const err = new Error('Transfer request not found or already processed.');
    err.statusCode = 404;
    throw err;
  }

  logActivity({
    actor: reviewedBy,
    action: 'REJECT_TRANSFER',
    entityType: 'TransferRequest',
    entityId: transferRequest._id,
  }).catch(() => {});

  emitSafe('transfer:rejected', { transferRequest });
  return transferRequest;
};

module.exports = { allocateAsset, returnAsset, createTransferRequest, approveTransfer, rejectTransfer };
