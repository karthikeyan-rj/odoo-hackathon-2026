import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000'
})

// attach token to every request
api.interceptors.request.use(function(config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

// Named API client exports
export function getAllocations() {
  return api.get('/api/allocations');
}

export function returnAllocation(id, notes) {
  return api.post(`/api/allocations/${id}/return`, { returnConditionNotes: notes });
}

export function createTransfer(data) {
  return api.post('/api/transfers', data);
}

export function getBookings() {
  return api.get('/api/bookings');
}

export function createBooking(data) {
  return api.post('/api/bookings', data);
}

export function getBookableAssets() {
  return api.get('/api/assets', { params: { isBookable: true, status: 'Available' } });
}

export function getMaintenanceRequests() {
  return api.get('/api/maintenance');
}

export function createMaintenanceRequest(data) {
  return api.post('/api/maintenance', data);
}

// Asset management
export function getAssets(filters) {
  return api.get('/api/assets', { params: filters || {} });
}

export function createAsset(data) {
  return api.post('/api/assets', data);
}

export function getAssetHistory(id) {
  return api.get(`/api/assets/${id}/history`);
}

// Allocation management
export function allocateAsset(data) {
  return api.post('/api/allocations', data);
}

// Transfer management
export function getTransferRequests(status) {
  return api.get('/api/transfers', { params: status ? { status } : {} });
}

export function approveTransfer(id) {
  return api.put(`/api/transfers/${id}/approve`);
}

export function rejectTransfer(id) {
  return api.put(`/api/transfers/${id}/reject`);
}

// Maintenance approvals
export function getPendingMaintenance() {
  return api.get('/api/maintenance', { params: { status: 'Pending' } });
}

export function approveMaintenance(id, technicianName) {
  return api.put(`/api/maintenance/${id}/approve`, { technicianName });
}

export function rejectMaintenance(id) {
  return api.put(`/api/maintenance/${id}/reject`);
}

// Departments
export function getDepartments() { return api.get('/api/departments'); }
export function createDepartment(data) { return api.post('/api/departments', data); }
export function updateDepartment(id, data) { return api.put(`/api/departments/${id}`, data); }

// Categories
export function getAssetCategories() { return api.get('/api/categories'); }
export function createAssetCategory(data) { return api.post('/api/categories', data); }

// Users
export function getUsers() { return api.get('/api/users'); }
export function promoteUser(id, role) { return api.put(`/api/users/${id}/role`, { role }); }

// Notifications
export function getNotifications() { return api.get('/api/notifications'); }
export function markNotificationRead(id) { return api.put(`/api/notifications/${id}/read`); }
export function markAllNotificationsRead() { return api.put('/api/notifications/read-all'); }

// Audits
export function getAudits() { return api.get('/api/audits'); }
export function createAuditCycle(data) { return api.post('/api/audits', data); }
export function getAuditDetails(id) { return api.get(`/api/audits/${id}`); }
export function updateAuditItem(cycleId, itemId, data) { return api.put(`/api/audits/${cycleId}/items/${itemId}`, data); }
export function closeAuditCycle(id) { return api.put(`/api/audits/${id}/close`); }
export function getActivityLogs() { return api.get('/api/activity-logs'); }

// Department Head specific
export function getDepartmentAllocations() { return api.get('/api/allocations/department'); }
export function getDepartmentApprovals() { return api.get('/api/transfers/department'); }

export default api
