// Single source of truth for status -> color, mirroring the dot colors used by
// StatusChip so charts read as the same visual language as the status chips.
export const STATUS_HEX = {
  Available: '#10B981',
  Allocated: '#F59E0B',
  UnderMaintenance: '#F43F5E',
  Reserved: '#3B82F6',
  Retired: '#64748B',
  Disposed: '#64748B',
  Requested: '#3B82F6',
  Pending: '#F59E0B',
  Approved: '#10B981',
  Rejected: '#F43F5E',
  TechnicianAssigned: '#3B82F6',
  InProgress: '#F59E0B',
  Resolved: '#10B981',
  Active: '#10B981',
  Returned: '#64748B',
  Upcoming: '#F59E0B',
  Ongoing: '#10B981',
  Completed: '#64748B',
  Cancelled: '#64748B',
};

export function statusLabel(status) {
  return status.replace(/([A-Z])/g, ' $1').trim();
}
