import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DataTable from '../../components/ui/DataTable';
import StatusChip from '../../components/ui/StatusChip';
import Modal from '../../components/ui/Modal';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

export default function AssetListPage() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'AssetManager';

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Register Modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: '', serialNumber: '', description: '', isBookable: false
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = '?';
      if (search) query += `search=${search}&`;
      if (statusFilter) query += `status=${statusFilter}&`;
      
      const [assetRes, catRes, deptRes] = await Promise.all([
        api.get(`/assets${query}`),
        api.get('/asset-categories'),
        api.get('/departments')
      ]);
      setAssets(assetRes.data.data);
      setCategories(catRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for socket events to update asset status live
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData(); // Simplest: refetch list on relevant events
    
    socket.on('allocation:created', handleUpdate);
    socket.on('allocation:returned', handleUpdate);
    socket.on('maintenance:statusChanged', handleUpdate);

    return () => {
      socket.off('allocation:created', handleUpdate);
      socket.off('allocation:returned', handleUpdate);
      socket.off('maintenance:statusChanged', handleUpdate);
    };
  }, [socket]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', formData);
      setRegisterModalOpen(false);
      setFormData({ name: '', category: '', serialNumber: '', description: '', isBookable: false });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/asset-categories', { name: newCategoryName });
      setCategories([...categories, res.data.data]);
      setFormData({ ...formData, category: res.data.data._id });
      setIsCreatingCategory(false);
      setNewCategoryName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const columns = [
    { header: 'Tag', accessor: 'assetTag', className: 'font-mono font-medium text-accent' },
    { header: 'Name', accessor: 'name', className: 'font-medium' },
    { header: 'Category', render: (row) => row.category?.name || '-' },
    { header: 'Bookable', render: (row) => row.isBookable ? 'Yes' : 'No' },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade_in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Asset Registry</h1>
          <p className="text-sm text-ink-muted mt-1">Master list of all physical assets and their current state.</p>
        </div>
        {canManage && (
          <button onClick={() => setRegisterModalOpen(true)} className="btn bg-accent text-white hover:bg-accent-hover px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            Register New Asset
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by tag, name, serial..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border-border bg-surface px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48 rounded-lg border-border bg-surface px-4 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="UnderMaintenance">Under Maintenance</option>
          <option value="Reserved">Reserved</option>
        </select>
      </div>

      <DataTable 
        columns={columns} 
        data={assets} 
        loading={loading} 
        onRowClick={(row) => navigate(`/assets/${row._id}`)} 
      />

      <Modal isOpen={registerModalOpen} onClose={() => setRegisterModalOpen(false)} title="Register Asset">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Asset Name</label>
            <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-ink">Category</label>
              {canManage && !isCreatingCategory && (
                <button type="button" onClick={() => setIsCreatingCategory(true)} className="text-xs text-accent hover:underline focus:outline-none">+ New Category</button>
              )}
            </div>
            {isCreatingCategory ? (
              <div className="flex gap-2">
                <input type="text" placeholder="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1 rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" />
                <button type="button" onClick={handleCreateCategory} className="px-3 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">Save</button>
                <button type="button" onClick={() => setIsCreatingCategory(false)} className="px-3 py-2 bg-bg text-ink-muted rounded-lg text-sm font-medium hover:text-ink">Cancel</button>
              </div>
            ) : (
              <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm">
                <option value="" disabled>Select a category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Serial Number</label>
            <input type="text" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isBookable" checked={formData.isBookable} onChange={(e) => setFormData({...formData, isBookable: e.target.checked})} className="rounded text-accent focus:ring-accent" />
            <label htmlFor="isBookable" className="text-sm font-medium text-ink">Is this asset bookable? (e.g. Conference Room, Projector)</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setRegisterModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Register</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
