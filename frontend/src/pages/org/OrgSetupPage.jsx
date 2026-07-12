import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatusChip from '../../components/ui/StatusChip';

export default function OrgSetupPage() {
  const [activeTab, setActiveTab] = useState('employees');
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newRole, setNewRole] = useState('AssetManager');

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, catRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments'),
        api.get('/asset-categories')
      ]);
      setEmployees(empRes.data.data);
      setDepartments(deptRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${selectedEmployee._id}/role`, { role: newRole });
      setPromoteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departments', { name: newDeptName });
      setDeptModalOpen(false);
      setNewDeptName('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleCreateCat = async (e) => {
    e.preventDefault();
    try {
      await api.post('/asset-categories', { name: newCatName });
      setCatModalOpen(false);
      setNewCatName('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const employeeColumns = [
    { header: 'Name', accessor: 'name', className: 'font-medium' },
    { header: 'Email', accessor: 'email', className: 'text-ink-muted' },
    { header: 'Department', render: (row) => row.department?.name || '-' },
    { header: 'Role', render: (row) => <span className="text-xs font-mono px-2 py-1 bg-bg rounded-md">{row.role}</span> },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { header: 'Actions', render: (row) => (
      <button 
        onClick={() => { setSelectedEmployee(row); setPromoteModalOpen(true); }}
        className="text-accent text-sm font-medium hover:underline focus-visible:outline-none"
      >
        Promote
      </button>
    )}
  ];

  const deptColumns = [
    { header: 'Department Name', accessor: 'name', className: 'font-medium' },
    { header: 'Head', render: (row) => row.head?.name || '-' },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> }
  ];

  const catColumns = [
    { header: 'Category Name', accessor: 'name', className: 'font-medium' },
    { header: 'ID (Reference)', accessor: '_id', className: 'font-mono text-xs text-ink-muted' },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade_in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Organization Setup</h1>
          <p className="text-sm text-ink-muted mt-1">Manage employees, departments, and categories.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border mb-6">
        {['employees', 'departments', 'categories'].map((tab) => (
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

      {activeTab === 'employees' && (
        <DataTable columns={employeeColumns} data={employees} loading={loading} />
      )}

      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setDeptModalOpen(true)} className="btn bg-surface border border-border text-ink hover:bg-bg px-4 py-2 rounded-lg text-sm font-medium">
              + New Department
            </button>
          </div>
          <DataTable columns={deptColumns} data={departments} loading={loading} />
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setCatModalOpen(true)} className="btn bg-surface border border-border text-ink hover:bg-bg px-4 py-2 rounded-lg text-sm font-medium">
              + New Category
            </button>
          </div>
          <DataTable columns={catColumns} data={categories} loading={loading} />
        </div>
      )}

      {/* Promote Modal */}
      <Modal isOpen={promoteModalOpen} onClose={() => setPromoteModalOpen(false)} title="Promote Employee">
        <form onSubmit={handlePromote} className="space-y-4">
          <p className="text-sm text-ink-muted">Change role for <strong className="text-ink">{selectedEmployee?.name}</strong>.</p>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">New Role</label>
            <select 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full rounded-lg border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            >
              <option value="Employee">Employee</option>
              <option value="DepartmentHead">Department Head</option>
              <option value="AssetManager">Asset Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setPromoteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors shadow-sm">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Dept Modal */}
      <Modal isOpen={deptModalOpen} onClose={() => setDeptModalOpen(false)} title="Create Department">
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Department Name</label>
            <input required type="text" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="w-full rounded-lg border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setDeptModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Create</button>
          </div>
        </form>
      </Modal>

      {/* Cat Modal */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title="Create Category">
        <form onSubmit={handleCreateCat} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Category Name</label>
            <input required type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full rounded-lg border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setCatModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
