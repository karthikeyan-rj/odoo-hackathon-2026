import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatusChip from '../../components/ui/StatusChip';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

export default function AllocationPage() {
  const [activeTab, setActiveTab] = useState('allocations');
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'AssetManager';

  // Allocation Modal
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocAssetId, setAllocAssetId] = useState('');
  const [allocTargetId, setAllocTargetId] = useState('');
  const [allocTargetType, setAllocTargetType] = useState('User');
  
  // Selection data
  const [availableAssets, setAvailableAssets] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Transfer Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferAssetId, setTransferAssetId] = useState(''); // asset ID
  const [transferTargetId, setTransferTargetId] = useState(''); // user ID

  useEffect(() => {
    fetchData();
    fetchSelectionData();
  }, [activeTab]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    socket.on('allocation:created', handleUpdate);
    socket.on('allocation:returned', handleUpdate);
    socket.on('transfer:requested', handleUpdate);
    socket.on('transfer:approved', handleUpdate);
    socket.on('transfer:rejected', handleUpdate);
    return () => {
      socket.off('allocation:created', handleUpdate);
      socket.off('allocation:returned', handleUpdate);
      socket.off('transfer:requested', handleUpdate);
      socket.off('transfer:approved', handleUpdate);
      socket.off('transfer:rejected', handleUpdate);
    };
  }, [socket, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'allocations') {
        const res = await api.get('/allocations');
        setAllocations(res.data.data);
      } else {
        const res = await api.get('/allocations/transfers');
        setTransfers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectionData = async () => {
    try {
      const [assRes, usrRes] = await Promise.all([
        api.get('/assets?status=Available'),
        api.get('/users')
      ]);
      setAvailableAssets(assRes.data.data);
      setUsersList(usrRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/allocations', { assetId: allocAssetId, targetId: allocTargetId, targetType: allocTargetType });
      setAllocateModalOpen(false);
      setAllocAssetId('');
      setAllocTargetId('');
      fetchData();
      fetchSelectionData(); // refresh available assets
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to allocate');
    }
  };

  const handleReturn = async (allocationId) => {
    if (!confirm('Return this asset?')) return;
    try {
      await api.post(`/allocations/${allocationId}/return`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return');
    }
  };

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/allocations/transfers', { assetId: transferAssetId, targetId: transferTargetId, targetType: 'User' });
      setTransferModalOpen(false);
      setTransferAssetId('');
      setTransferTargetId('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request transfer');
    }
  };

  const handleApproveTransfer = async (transferId) => {
    try {
      await api.post(`/allocations/transfers/${transferId}/approve`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectTransfer = async (transferId) => {
    try {
      await api.post(`/allocations/transfers/${transferId}/reject`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const allocColumns = [
    { header: 'Asset', render: (row) => <span className="font-medium">{row.asset?.name} <span className="text-ink-muted text-xs font-mono ml-1">{row.asset?.assetTag}</span></span> },
    { header: 'Assignee', render: (row) => row.assignee?.name || 'Unknown' },
    { header: 'Type', render: (row) => row.assigneeType },
    { header: 'Allocated By', render: (row) => row.allocatedBy?.name },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { header: 'Actions', render: (row) => row.status === 'Active' && canManage ? (
      <button onClick={() => handleReturn(row._id)} className="text-accent text-sm font-medium hover:underline">Return</button>
    ) : null }
  ];

  const transferColumns = [
    { header: 'Asset', render: (row) => <span className="font-medium">{row.asset?.name}</span> },
    { header: 'Requested By', render: (row) => row.requestedBy?.name },
    { header: 'Target User', render: (row) => row.targetId?.name || '-' },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { header: 'Actions', render: (row) => row.status === 'Requested' && canManage ? (
      <div className="flex gap-3">
        <button onClick={() => handleApproveTransfer(row._id)} className="text-status-available text-sm font-medium hover:underline">Approve</button>
        <button onClick={() => handleRejectTransfer(row._id)} className="text-status-maintenance text-sm font-medium hover:underline">Reject</button>
      </div>
    ) : null }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade_in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Allocations & Transfers</h1>
          <p className="text-sm text-ink-muted mt-1">Manage who holds which assets.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setTransferModalOpen(true)} className="btn bg-surface border border-border text-ink hover:bg-bg px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            Request Transfer
          </button>
          {canManage && (
            <button onClick={() => setAllocateModalOpen(true)} className="btn bg-accent text-white hover:bg-accent-hover px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              Allocate Asset
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-border mb-6">
        {['allocations', 'transfers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-medium capitalize border-b-2 transition-colors
              ${activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'allocations' && (
        <DataTable columns={allocColumns} data={allocations} loading={loading} />
      )}

      {activeTab === 'transfers' && (
        <DataTable columns={transferColumns} data={transfers} loading={loading} />
      )}

      {/* Allocate Modal */}
      <Modal isOpen={allocateModalOpen} onClose={() => setAllocateModalOpen(false)} title="Allocate Asset">
        <form onSubmit={handleAllocate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Select Asset</label>
            <select required value={allocAssetId} onChange={(e) => setAllocAssetId(e.target.value)} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm">
              <option value="" disabled>-- Available Assets --</option>
              {availableAssets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Assign To</label>
            <select required value={allocTargetId} onChange={(e) => setAllocTargetId(e.target.value)} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm">
              <option value="" disabled>-- Select User --</option>
              {usersList.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setAllocateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Allocate</button>
          </div>
        </form>
      </Modal>

      {/* Transfer Request Modal */}
      <Modal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} title="Request Transfer">
        <form onSubmit={handleTransferRequest} className="space-y-4">
          <p className="text-sm text-ink-muted">Request to transfer an asset currently held by someone else.</p>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Asset ID to Transfer</label>
            <input required type="text" placeholder="Enter precise Asset ID..." value={transferAssetId} onChange={(e) => setTransferAssetId(e.target.value)} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Target User</label>
            <select required value={transferTargetId} onChange={(e) => setTransferTargetId(e.target.value)} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm">
              <option value="" disabled>-- Select Target User --</option>
              {usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setTransferModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
