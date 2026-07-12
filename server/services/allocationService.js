const Asset = require("../models/Asset");
const Allocation = require("../models/Allocation");

/**
 * Allocate an asset to a user or department.
 *
 * 1. Check that the asset is Available.
 * 2. Create an Active allocation.
 * 3. Change the asset status to Allocated.
 * 4. If the asset update fails, remove the allocation to avoid
 *    inconsistent data.
 *
 * @param {Object} params
 * @param {string} params.assetId
 * @param {"User"|"Department"} params.assigneeType
 * @param {string} [params.assigneeUser]
 * @param {string} [params.assigneeDepartment]
 * @param {string} params.allocatedBy
 * @param {Date}   [params.expectedReturnDate]
 * @returns {Promise<Object>} The created allocation document.
 */
async function allocateAsset({
  assetId,
  assigneeType,
  assigneeUser,
  assigneeDepartment,
  allocatedBy,
  expectedReturnDate,
}) {
  // 1. Verify the asset exists and is Available
  const asset = await Asset.findById(assetId);

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (asset.status !== "Available") {
    throw new Error(
      `Asset is not available (current status: ${asset.status})`
    );
  }

  // 2. Create the allocation
  let allocation;

  try {
    allocation = await Allocation.create({
      asset: assetId,
      assigneeType,
      assigneeUser: assigneeType === "User" ? assigneeUser : undefined,
      assigneeDepartment:
        assigneeType === "Department" ? assigneeDepartment : undefined,
      allocatedBy,
      expectedReturnDate: expectedReturnDate || null,
    });
  } catch (err) {
    // Handle duplicate active-allocation index error
    if (err.code === 11000) {
      throw new Error(
        "This asset already has an active allocation"
      );
    }

    throw err;
  }

  // 3. Update asset status
  try {
    await Asset.findByIdAndUpdate(assetId, {
      status: "Allocated",
    });
  } catch (err) {
    // Rollback: remove the allocation we just created
    await Allocation.findByIdAndDelete(allocation._id);
    throw new Error(
      "Failed to update asset status; allocation rolled back"
    );
  }

  return allocation;
}

/**
 * Return an allocated asset.
 *
 * 1. Close the active allocation as Returned.
 * 2. Record returnedAt and optional condition notes.
 * 3. Change the asset status to Available.
 *
 * @param {Object} params
 * @param {string} params.assetId
 * @param {string} [params.returnConditionNotes]
 * @returns {Promise<Object>} The updated allocation document.
 */
async function returnAsset({ assetId, returnConditionNotes }) {
  const allocation = await Allocation.findOne({
    asset: assetId,
    status: "Active",
  });

  if (!allocation) {
    throw new Error(
      "No active allocation found for this asset"
    );
  }

  allocation.status = "Returned";
  allocation.returnedAt = new Date();
  allocation.returnConditionNotes = returnConditionNotes || "";
  await allocation.save();

  await Asset.findByIdAndUpdate(assetId, {
    status: "Available",
  });

  return allocation;
}

/**
 * Approve a transfer request.
 *
 * 1. Close the existing active allocation as Transferred.
 * 2. Create a new Active allocation for the transfer target.
 * 3. History is preserved — the old allocation is never deleted.
 *
 * @param {Object} params
 * @param {Object} params.transferRequest  The full transfer request document.
 * @param {string} params.reviewedBy       The user approving the transfer.
 * @returns {Promise<Object>} The newly created allocation.
 */
async function approveTransfer({ transferRequest, reviewedBy }) {
  // Close the existing allocation
  const oldAllocation = await Allocation.findOne({
    asset: transferRequest.asset,
    status: "Active",
  });

  if (!oldAllocation) {
    throw new Error(
      "No active allocation found to transfer"
    );
  }

  oldAllocation.status = "Transferred";
  oldAllocation.returnedAt = new Date();
  oldAllocation.returnConditionNotes = "Transferred";
  await oldAllocation.save();

  // Create new allocation for the target
  const newAllocation = await Allocation.create({
    asset: transferRequest.asset,
    assigneeType: transferRequest.targetType,
    assigneeUser:
      transferRequest.targetType === "User"
        ? transferRequest.targetUser
        : undefined,
    assigneeDepartment:
      transferRequest.targetType === "Department"
        ? transferRequest.targetDepartment
        : undefined,
    allocatedBy: reviewedBy,
  });

  return newAllocation;
}

module.exports = {
  allocateAsset,
  returnAsset,
  approveTransfer,
};
