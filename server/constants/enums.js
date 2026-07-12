const USER_ROLES = [
  "Admin",
  "AssetManager",
  "DepartmentHead",
  "Employee",
];

const ACTIVE_STATUS = ["Active", "Inactive"];

const ASSET_CONDITIONS = [
  "New",
  "Good",
  "Fair",
  "Poor",
  "Damaged",
];

const ASSET_STATUSES = [
  "Available",
  "Allocated",
  "Reserved",
  "UnderMaintenance",
  "Lost",
  "Retired",
  "Disposed",
];

const ALLOCATION_STATUSES = [
  "Active",
  "Returned",
  "Transferred",
];

const TRANSFER_STATUSES = [
  "Requested",
  "Approved",
  "Rejected",
];

const BOOKING_STATUSES = [
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
];

const MAINTENANCE_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const MAINTENANCE_STATUSES = [
  "Pending",
  "Approved",
  "Rejected",
  "TechnicianAssigned",
  "InProgress",
  "Resolved",
];

const AUDIT_STATUSES = [
  "Open",
  "Closed",
];

const AUDIT_RESULTS = [
  "Pending",
  "Verified",
  "Missing",
  "Damaged",
];

module.exports = {
  USER_ROLES,
  ACTIVE_STATUS,
  ASSET_CONDITIONS,
  ASSET_STATUSES,
  ALLOCATION_STATUSES,
  TRANSFER_STATUSES,
  BOOKING_STATUSES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  AUDIT_STATUSES,
  AUDIT_RESULTS,
};
