// server/constants/enums.js
// Single source of truth for all enum values used across models

const ROLES = {
  EMPLOYEE: 'Employee',
  DEPARTMENT_HEAD: 'DepartmentHead',
  ASSET_MANAGER: 'AssetManager',
  ADMIN: 'Admin',
};

const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const DEPARTMENT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const ASSET_CATEGORY_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const ASSET_STATUS = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  UNDER_MAINTENANCE: 'UnderMaintenance',
  RETIRED: 'Retired',
  DISPOSED: 'Disposed',
};

const ASSIGNEE_TYPE = {
  USER: 'User',
  DEPARTMENT: 'Department',
};

const ALLOCATION_STATUS = {
  ACTIVE: 'Active',
  RETURNED: 'Returned',
  TRANSFERRED: 'Transferred',
};

const TRANSFER_STATUS = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const BOOKING_STATUS = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const MAINTENANCE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  TECHNICIAN_ASSIGNED: 'TechnicianAssigned',
  IN_PROGRESS: 'InProgress',
  RESOLVED: 'Resolved',
};

const MAINTENANCE_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const NOTIFICATION_TYPE = {
  ASSET_ALLOCATED: 'AssetAllocated',
  ASSET_RETURNED: 'AssetReturned',
  MAINTENANCE_APPROVED: 'MaintenanceApproved',
  MAINTENANCE_REJECTED: 'MaintenanceRejected',
  BOOKING_CONFIRMED: 'BookingConfirmed',
  BOOKING_CANCELLED: 'BookingCancelled',
  TRANSFER_APPROVED: 'TransferApproved',
  TRANSFER_REJECTED: 'TransferRejected',
  OVERDUE_RETURN: 'OverdueReturn',
};

const ENTITY_TYPE = {
  ASSET: 'Asset',
  ALLOCATION: 'Allocation',
  TRANSFER_REQUEST: 'TransferRequest',
  BOOKING: 'Booking',
  MAINTENANCE_REQUEST: 'MaintenanceRequest',
};

module.exports = {
  ROLES,
  USER_STATUS,
  DEPARTMENT_STATUS,
  ASSET_CATEGORY_STATUS,
  ASSET_STATUS,
  ASSIGNEE_TYPE,
  ALLOCATION_STATUS,
  TRANSFER_STATUS,
  BOOKING_STATUS,
  MAINTENANCE_STATUS,
  MAINTENANCE_PRIORITY,
  NOTIFICATION_TYPE,
  ENTITY_TYPE,
};
