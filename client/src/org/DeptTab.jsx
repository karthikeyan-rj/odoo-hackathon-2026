import React, { useState, useEffect } from "react";
import { getDepartments, createDepartment, updateDepartment, getUsers } from "../api";

export default function DeptTab() {
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", head: "", parentDepartment: "", status: "Active" });

  const load = () => {
    setLoading(true);
    Promise.all([
      getDepartments().then(r => setDepts(r.data || [])),
      getUsers().then(r => setUsers(r.data || []))
    ]).catch(() => setError("Failed to load departments.")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (d) => {
    setEditId(d._id);
    setForm({ name: d.name, head: d.head?._id || "", parentDepartment: d.parentDepartment?._id || "", status: d.status || "Active" });
    setShowForm(true);
  };

  const reset = () => { setShowForm(false); setEditId(null); setForm({ name: "", head: "", parentDepartment: "", status: "Active" }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await updateDepartment(editId, form); }
      else { await createDepartment(form); }
      reset(); load();
    } catch (err) { setError(err.response?.data?.error || "Save failed."); }
  };

  const sel = "w-full p-2 border border-zinc-200 rounded bg-white text-xs";

  if (loading) return <div className="text-xs text-zinc-500 p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex justify-between">{error}<button onClick={() => setError("")} className="font-bold">×</button></div>}
      <div className="flex justify-end">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); }} className="px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-700">
          {showForm ? "Cancel" : "+ Add Department"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-50 border border-zinc-200 rounded p-4 grid grid-cols-2 gap-3">
          <input required placeholder="Department name" className={sel} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <select className={sel} value={form.head} onChange={e => setForm({ ...form, head: e.target.value })}>
            <option value="">No head assigned</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <select className={sel} value={form.parentDepartment} onChange={e => setForm({ ...form, parentDepartment: e.target.value })}>
            <option value="">No parent</option>
            {depts.filter(d => d._id !== editId).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select className={sel} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option>Active</option><option>Inactive</option>
          </select>
          <button type="submit" className="col-span-2 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 text-xs">
            {editId ? "Save Changes" : "Create Department"}
          </button>
        </form>
      )}

      {depts.length === 0 ? (
        <div className="p-4 text-xs text-zinc-400 bg-white border border-zinc-200 rounded">No departments yet.</div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
              <tr><th className="px-4 py-2.5 text-left">Name</th><th className="px-4 py-2.5 text-left">Head</th><th className="px-4 py-2.5 text-left">Status</th><th className="px-4 py-2.5 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {depts.map(d => (
                <tr key={d._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{d.name}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{d.head?.name || "—"}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{d.status}</td>
                  <td className="px-4 py-2.5 text-right"><button onClick={() => openEdit(d)} className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
