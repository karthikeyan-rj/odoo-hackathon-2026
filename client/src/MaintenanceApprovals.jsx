import React, { useState, useEffect } from "react";
import { getPendingMaintenance, approveMaintenance, rejectMaintenance } from "./api";
import StatusBadge from "./StatusBadge";

export default function MaintenanceApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approveId, setApproveId] = useState(null);
  const [techName, setTechName] = useState("");

  const load = () => {
    setLoading(true);
    getPendingMaintenance()
      .then(r => setRequests(r.data || []))
      .catch(() => setError("Failed to load maintenance requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try {
      await approveMaintenance(id, techName);
      setApproveId(null); setTechName(""); load();
    } catch (err) { setError(err.response?.data?.error || "Approve failed."); }
  };

  const handleReject = async (id) => {
    try {
      await rejectMaintenance(id); load();
    } catch (err) { setError(err.response?.data?.error || "Reject failed."); }
  };

  if (loading) return <div className="text-xs text-zinc-500">Loading maintenance requests...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-zinc-900">Maintenance Approvals</h2>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex justify-between">
          {error}<button onClick={() => setError("")} className="font-bold">×</button>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="p-4 bg-white border border-zinc-200 rounded text-xs text-zinc-400">No pending maintenance requests.</div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Asset</th>
                <th className="px-4 py-2.5 text-left">Description</th>
                <th className="px-4 py-2.5 text-left">Priority</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-left">Raised By</th>
                <th className="px-4 py-2.5 text-left">Date</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {requests.map(r => (
                <React.Fragment key={r._id}>
                  <tr className="hover:bg-zinc-50">
                    <td className="px-4 py-2.5 font-medium text-zinc-900">{r.asset?.name}</td>
                    <td className="px-4 py-2.5 text-zinc-600" title={r.description}>
                      {r.description?.length > 60 ? r.description.slice(0, 60) + "…" : r.description}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge value={r.priority} /></td>
                    <td className="px-4 py-2.5"><StatusBadge value={r.status} /></td>
                    <td className="px-4 py-2.5 text-zinc-600">{r.raisedBy?.name || "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-right space-x-2">
                      <button
                        onClick={() => { setApproveId(approveId === r._id ? null : r._id); setTechName(""); }}
                        className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(r._id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                  {approveId === r._id && (
                    <tr className="bg-emerald-50">
                      <td colSpan="7" className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            placeholder="Technician name..."
                            className="flex-1 p-2 border border-zinc-200 rounded text-xs bg-white"
                            value={techName}
                            onChange={e => setTechName(e.target.value)}
                          />
                          <button onClick={() => handleApprove(r._id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium text-xs">
                            Confirm Approval
                          </button>
                          <button onClick={() => setApproveId(null)} className="px-3 py-1.5 border border-zinc-300 rounded bg-white text-xs">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
