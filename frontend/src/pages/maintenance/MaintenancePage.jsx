import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatusChip from '../../components/ui/StatusChip';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

export default function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'AssetManager';

  // Raise Modal
  const [raiseModalOpen, setRaiseModalOpen] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [formData, setFormData] = useState({
    assetId: '', description: '', priority: 'Medium'
  });

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [technicianName, setTechnicianName] = useState('');

  useEffect(() => {
    fetchData();
    fetchAssets();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    socket.on('maintenance:statusChanged', handleUpdate);
    return () => socket.off('maintenance:statusChanged', handleUpdate);
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance');
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      // For raising maintenance, typically you can only raise it on assets you hold or if you're an admin, any asset.
      // For hackathon, just getting all active assets
      const res = await api.get('/assets');
      setAvailableAssets(res.data.data.filter(a => a.status !== 'Retired' && a.status !== 'Disposed'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRaise = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', formData);
      setRaiseModalOpen(false);
      setFormData({ assetId: '', description: '', priority: 'Medium' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to raise request');
    }
  };

  const handleAction = async (action, reqId) => {
    try {
      await api.patch(`/maintenance/${reqId}/${action}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action}`);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/maintenance/${selectedReqId}/assign-technician`, { technicianName });
      setAssignModalOpen(false);
      setTechnicianName('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign');
    }
  };

  const columns = [
    { header: 'Asset', render: (row) => <span className="font-medium">{row.asset?.name} <span className="text-ink-muted text-xs font-mono ml-1">{row.asset?.assetTag}</span></span> },
    { header: 'Priority', render: (row) => (
      <span className={`text-xs font-medium px-2 py-1 rounded ${
        row.priority === 'High' ? 'bg-red-50 text-red-700' :
        row.priority === 'Low' ? 'bg-gray-100 text-gray-700' :
        'bg-orange-50 text-orange-700'
      }`}>{row.priority}</span>
    )},
    { header: 'Raised By', render: (row) => row.raisedBy?.name },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { header: 'Actions', render: (row) => {
      if (!canManage) return null;
      if (row.status === 'Pending') return (
        <div className="flex gap-2">
          <button onClick={() => handleAction('approve', row._id)} className="text-status-available text-sm hover:underline">Approve</button>
          <button onClick={() => handleAction('reject', row._id)} className="text-status-maintenance text-sm hover:underline">Reject</button>
        </div>
      );
      if (row.status === 'Approved') return (
        <button onClick={() => { setSelectedReqId(row._id); setAssignModalOpen(true); }} className="text-status-reserved text-sm hover:underline">Assign Tech</button>
      );
      if (row.status === 'TechnicianAssigned') return (
        <button onClick={() => handleAction('in-progress', row._id)} className="text-status-allocated text-sm hover:underline">Start Work</button>
      );
      if (row.status === 'InProgress') return (
        <button onClick={() => handleAction('resolve', row._id)} className="text-status-available text-sm hover:underline">Resolve</button>
      );
      return null;
    }}
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade_in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Maintenance Operations</h1>
          <p className="text-sm text-ink-muted mt-1">Track repairs, calibrations, and downtime.</p>
        </div>
        <button onClick={() => setRaiseModalOpen(true)} className="btn bg-accent text-white hover:bg-accent-hover px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
          Report Issue
        </button>
      </div>

      <DataTable columns={columns} data={requests} loading={loading} emptyMessage="No maintenance requests." />

      <Modal isOpen={raiseModalOpen} onClose={() => setRaiseModalOpen(false)} title="Report Asset Issue">
        <form onSubmit={handleRaise} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Asset</label>
            <select required value={formData.assetId} onChange={(e) => setFormData({...formData, assetId: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm">
              <option value="" disabled>-- Select Asset --</option>
              {availableAssets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Priority</label>
            <select required value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High - Critical Issue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Issue Description</label>
            <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" placeholder="Describe the issue in detail..."></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setRaiseModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Submit Report</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Technician">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Technician Name / ID</label>
            <input required type="text" value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" placeholder="e.g. John Smith" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setAssignModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Assign</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
