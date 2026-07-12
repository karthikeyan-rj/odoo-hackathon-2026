import React, { useState, useEffect } from "react";
import { getUsers, promoteUser, updateUser, getDepartments } from "../api";
import StatusBadge from "../StatusBadge";
import { USER_ROLES, ACTIVE_STATUS } from "../constants";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      getUsers().then(r => setUsers(r.data || [])),
      getDepartments().then(r => setDepartments(r.data || []))
    ]).catch(() => setError("Failed to load users.")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateLocalUser = (id, updates) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, ...updates } : u));
  };

  const handlePromote = async (id, role) => {
    try {
      await promoteUser(id, role);
      updateLocalUser(id, { role });
    } catch (err) { setError(err.response?.data?.error || "Promote failed."); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateUser(id, { status });
      updateLocalUser(id, { status });
    } catch (err) { setError(err.response?.data?.error || "Status update failed."); }
  };

  const handleDepartmentChange = async (id, department) => {
    try {
      await updateUser(id, { department });
      updateLocalUser(id, { department: departments.find(d => d._id === department) || null });
    } catch (err) { setError(err.response?.data?.error || "Department update failed."); }
  };

  if (loading) return <div className="text-xs text-zinc-500 p-4">Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
        This is the only place roles are assigned.
      </div>

      {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex justify-between">{error}<button onClick={() => setError("")} className="font-bold">×</button></div>}

      {users.length === 0 ? (
        <div className="p-4 text-xs text-zinc-400 bg-white border border-zinc-200 rounded">No users found.</div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-left">Email</th>
                <th className="px-4 py-2.5 text-left">Role</th>
                <th className="px-4 py-2.5 text-left">Department</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-left">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{u.name}</td>
                  <td className="px-4 py-2.5 text-zinc-500">{u.email}</td>
                  <td className="px-4 py-2.5"><StatusBadge value={u.role} /></td>
                  <td className="px-4 py-2.5">
                    <select
                      className="p-1.5 border border-zinc-200 rounded bg-white text-xs"
                      value={u.department?._id || ""}
                      onChange={e => handleDepartmentChange(u._id, e.target.value)}
                    >
                      <option value="">No department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      className="p-1.5 border border-zinc-200 rounded bg-white text-xs"
                      value={u.status || "Active"}
                      onChange={e => handleStatusChange(u._id, e.target.value)}
                    >
                      {ACTIVE_STATUS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      className="p-1.5 border border-zinc-200 rounded bg-white text-xs"
                      value={u.role}
                      onChange={e => handlePromote(u._id, e.target.value)}
                    >
                      {USER_ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
