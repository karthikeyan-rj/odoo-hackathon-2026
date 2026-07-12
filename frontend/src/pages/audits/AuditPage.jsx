import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatusChip from '../../components/ui/StatusChip';
import dayjs from 'dayjs';

export default function AuditPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Audit Modal
  const [newAuditModalOpen, setNewAuditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', scopeLocation: '' });

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditItems, setAuditItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audits');
      setAudits(res.data); // backend returns raw array based on ragasudha's route
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/audits', formData);
      setNewAuditModalOpen(false);
      setFormData({ title: '', scopeLocation: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create audit');
    }
  };

  const loadAuditDetails = async (id) => {
    try {
      const res = await api.get(`/audits/${id}`);
      setSelectedAudit(res.data.cycle);
      setAuditItems(res.data.items);
      setDetailModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkItem = async (itemId, result) => {
    try {
      await api.put(`/audits/${selectedAudit._id}/items/${itemId}`, { result });
      loadAuditDetails(selectedAudit._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseAudit = async () => {
    if (!confirm('Are you sure you want to close this audit? This will update the lifecycle status of all assets involved.')) return;
    try {
      await api.put(`/audits/${selectedAudit._id}/close`);
      setDetailModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close audit');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', className: 'font-medium' },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { header: 'Created By', render: (row) => row.createdBy?.name || '-' },
    { header: 'Start Date', render: (row) => row.startDate ? dayjs(row.startDate).format('MMM D, YYYY') : '-' },
    { header: 'Actions', render: (row) => (
      <button onClick={() => loadAuditDetails(row._id)} className="text-accent text-sm font-medium hover:underline">
        View
      </button>
    ) }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade_in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Asset Audits</h1>
          <p className="text-sm text-ink-muted mt-1">Conduct regular inventory checks and audits.</p>
        </div>
        <button onClick={() => setNewAuditModalOpen(true)} className="btn bg-accent text-white hover:bg-accent-hover px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
          Start New Audit
        </button>
      </div>

      <DataTable columns={columns} data={audits} loading={loading} emptyMessage="No audits found." />

      {/* New Audit Modal */}
      <Modal isOpen={newAuditModalOpen} onClose={() => setNewAuditModalOpen(false)} title="Start New Audit Cycle">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Audit Title</label>
            <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" placeholder="e.g. Q3 HQ Equipment Audit" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Scope (Location)</label>
            <input type="text" value={formData.scopeLocation} onChange={(e) => setFormData({...formData, scopeLocation: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" placeholder="Leave blank for all locations" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setNewAuditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Create Audit</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedAudit && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Audit: ${selectedAudit.title}`}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex justify-between items-center bg-bg p-4 rounded-lg">
              <div>
                <div className="text-sm text-ink-muted">Status</div>
                <div className="font-medium"><StatusChip status={selectedAudit.status} /></div>
              </div>
              {selectedAudit.status === 'Open' && (
                <button onClick={handleCloseAudit} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">
                  Close Audit
                </button>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-ink mb-2">Audit Items ({auditItems.length})</h3>
              <div className="space-y-2">
                {auditItems.map(item => (
                  <div key={item._id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface">
                    <div>
                      <div className="font-medium">{item.asset?.name || 'Unknown Asset'}</div>
                      <div className="text-xs text-ink-muted">{item.asset?.assetTag}</div>
                    </div>
                    
                    {selectedAudit.status === 'Open' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleMarkItem(item._id, 'Verified')} className={`px-2 py-1 text-xs rounded-md ${item.result === 'Verified' ? 'bg-green-100 text-green-700 font-bold' : 'bg-bg text-ink-muted hover:bg-green-50'}`}>Verified</button>
                        <button onClick={() => handleMarkItem(item._id, 'Damaged')} className={`px-2 py-1 text-xs rounded-md ${item.result === 'Damaged' ? 'bg-orange-100 text-orange-700 font-bold' : 'bg-bg text-ink-muted hover:bg-orange-50'}`}>Damaged</button>
                        <button onClick={() => handleMarkItem(item._id, 'Missing')} className={`px-2 py-1 text-xs rounded-md ${item.result === 'Missing' ? 'bg-red-100 text-red-700 font-bold' : 'bg-bg text-ink-muted hover:bg-red-50'}`}>Missing</button>
                      </div>
                    ) : (
                      <div className="text-sm font-medium">{item.result}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
