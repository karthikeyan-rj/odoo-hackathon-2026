import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartmentAllocations, getDepartmentApprovals, approveTransfer, rejectTransfer } from "./api";
import StatusBadge from "./StatusBadge";

export default function DepartmentView() {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      getDepartmentAllocations().then(r => setAllocations(r.data || [])),
      getDepartmentApprovals().then(r => setApprovals(r.data || []))
    ]).catch(() => setError("Failed to load department data.")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try { await approveTransfer(id); load(); }
    catch (err) { setMsg(err.response?.data?.error || "Approve failed."); }
  };

  const handleReject = async (id) => {
    try { await rejectTransfer(id); load(); }
    catch (err) { setMsg(err.response?.data?.error || "Reject failed."); }
  };

  if (loading) return <div className="text-xs text-zinc-500">Loading department data...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-bold text-zinc-900">Department View</h2>

      {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs">{error}</div>}
      {msg && <div className="p-2.5 bg-zinc-100 border border-zinc-200 rounded text-xs flex justify-between">{msg}<button onClick={() => setMsg("")} className="font-bold">×</button></div>}

      {/* Section 1: Department Assets */}
      <div className="bg-white border border-zinc-200 rounded">
        <div className="px-4 py-3 border-b border-zinc-100 font-semibold text-zinc-800">Department Assets</div>
        {allocations.length === 0 ? (
          <div className="px-4 py-4 text-xs text-zinc-400">No assets allocated to your department.</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Asset</th>
                <th className="px-4 py-2.5 text-left">Tag</th>
                <th className="px-4 py-2.5 text-left">Held By</th>
                <th className="px-4 py-2.5 text-left">Allocated</th>
                <th className="px-4 py-2.5 text-left">Due</th>
                <th className="px-4 py-2.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {allocations.map(a => {
                const overdue = a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();
                return (
                  <tr key={a._id} className="hover:bg-zinc-50">
                    <td className="px-4 py-2.5 font-medium text-zinc-900">{a.asset?.name}</td>
                    <td className="px-4 py-2.5 font-mono text-zinc-400">{a.asset?.assetTag}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{a.assigneeUser?.name || "Dept"}</td>
                    <td className="px-4 py-2.5 text-zinc-500">{new Date(a.allocatedAt).toLocaleDateString()}</td>
                    <td className={`px-4 py-2.5 ${overdue ? "text-red-600 font-semibold" : "text-zinc-500"}`}>
                      {a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge value={a.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Section 2: Pending Approvals */}
      <div className="bg-white border border-zinc-200 rounded">
        <div className="px-4 py-3 border-b border-zinc-100 font-semibold text-zinc-800">Pending Approvals</div>
        {approvals.length === 0 ? (
          <div className="px-4 py-4 text-xs text-zinc-400">No pending approvals.</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
              <tr><th className="px-4 py-2.5 text-left">Asset</th><th className="px-4 py-2.5 text-left">Requested By</th><th className="px-4 py-2.5 text-left">Status</th><th className="px-4 py-2.5 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {approvals.map(t => (
                <tr key={t._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{t.asset?.name}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{t.requestedBy?.name}</td>
                  <td className="px-4 py-2.5"><StatusBadge value={t.status} /></td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <button onClick={() => handleApprove(t._id)} className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Approve</button>
                    <button onClick={() => handleReject(t._id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Section 3: Book on behalf */}
      <div>
        <button onClick={() => navigate("/book-resource")} className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">
          Book Resource for Department
        </button>
      </div>
    </div>
  );
}
