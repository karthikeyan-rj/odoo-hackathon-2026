const Asset = require("../models/Asset");
const MaintenanceRequest = require("../models/MaintenanceRequest");

/**
 * Update a maintenance request status and apply the matching
 * asset lifecycle change.
 *
 * Rules:
 *  - Approving  → Asset status becomes UnderMaintenance
 *  - Resolving  → Asset status becomes Available
 *  - Rejecting  → Asset status is NOT changed
 *
 * @param {Object} params
 * @param {string} params.requestId    MaintenanceRequest _id
 * @param {string} params.newStatus    Target status
 * @param {string} [params.approvedBy] User who approved
 * @param {string} [params.technicianName]
 * @returns {Promise<Object>} The updated maintenance request.
 */
async function updateMaintenanceStatus({
  requestId,
  newStatus,
  approvedBy,
  technicianName,
}) {
  const request = await MaintenanceRequest.findById(requestId);

  if (!request) {
    throw new Error("Maintenance request not found");
  }

  const allowedTransitions = {
    Pending: ["Approved", "Rejected"],
    Approved: ["TechnicianAssigned", "InProgress"],
    TechnicianAssigned: ["InProgress"],
    InProgress: ["Resolved"],
  };
  if (!(allowedTransitions[request.status] || []).includes(newStatus)) {
    throw new Error(`Cannot move maintenance from ${request.status} to ${newStatus}`);
  }

  request.status = newStatus;

  if (newStatus === "Approved" && approvedBy) {
    request.approvedBy = approvedBy;
  }

  if (newStatus === "TechnicianAssigned" && technicianName) {
    request.technicianName = technicianName;
  }

  if (newStatus === "Resolved") {
    request.resolvedAt = new Date();
  }

  await request.save();

  // Asset lifecycle changes
  if (newStatus === "Approved") {
    await Asset.findByIdAndUpdate(request.asset, {
      status: "UnderMaintenance",
    });
  } else if (newStatus === "Resolved") {
    await Asset.findByIdAndUpdate(request.asset, {
      status: "Available",
    });
  }
  // Rejected → no asset status change

  return request;
}

module.exports = {
  updateMaintenanceStatus,
};
