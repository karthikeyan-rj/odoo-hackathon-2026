import React, { useState, useEffect } from "react";
import api, { getAssets, allocateAsset, getTransferRequests, approveTransfer, rejectTransfer, createTransfer } from "./api";
import StatusBadge from "./StatusBadge";

export default function AllocationManager() {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [conflict, setConflict] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [form, setForm] = useState({ assetId: "", assigneeType: "User", assigneeUserId: "", assigneeDepartmentId: "", expectedReturnDate: "" });
  const [transferReason, setTransferReason] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      getAssets({ status: "Available" }).then(r => setAssets(r.data || [])),
      api.get("/api/users").then(r => setUsers(r.data || [])),
      api.get("/api/departments").then(r => setDepts(r.data || [])),
      getTransferRequests("Requested").then(r => setTransfers(r.data || []))
    ]).catch(() => setMsg("Failed to load data.")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setConflict(null); setMsg("");
    try {
      await allocateAsset({
        asset: form.assetId,
        assigneeType: form.assigneeType,
        assigneeUser: form.assigneeType === "User" ? form.assigneeUserId : undefined,
        assigneeDepartment: form.assigneeType === "Department" ? form.assigneeDepartmentId : undefined,
        expectedReturnDate: form.expectedReturnDate || undefined
      });
      setMsg("Asset allocated successfully."); setForm({ assetId: "", assigneeType: "User", assigneeUserId: "", assigneeDepartmentId: "", expectedReturnDate: "" }); load();
    } catch (err) {
      if (err.response?.status === 409) { setConflict(err.response.data); }
      else { setMsg(err.response?.data?.error || "Allocation failed."); }
    }
  };

  const handleTransfer = async () => {
    try {
      await createTransfer({ asset: form.assetId, targetType: form.assigneeType, targetUser: form.assigneeType === "User" ? form.assigneeUserId : undefined, targetDepartment: form.assigneeType === "Department" ? form.assigneeDepartmentId : undefined, reason: transferReason });
      setMsg("Transfer request submitted."); setConflict(null); setShowTransfer(false); load();
    } catch (err) { setMsg(err.response?.data?.error || "Transfer failed."); }
  };

  const sel = "w-full p-2 border border-zinc-200 rounded bg-white text-xs";

  if (loading) return <div className="text-xs text-zinc-500">Loading...</div>;

  return (
    <div className="space-y-5">
      {msg && <div className="p-2.5 bg-zinc-100 border border-zinc-200 rounded text-xs flex justify-between">{msg}<button onClick={() => setMsg("")} className="font-bold">×</button></div>}

      <div className="bg-white border border-zinc-200 rounded p-4 space-y-3">
        <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Allocate Asset</h2>
        <form onSubmit={handleAllocate} className="grid grid-cols-2 gap-3">
          <select required className={sel} value={form.assetId} onChange={e => { setForm({ ...form, assetId: e.target.value }); setConflict(null); }}>
            <option value="">Select asset...</option>
            {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
          </select>
          <select className={sel} value={form.assigneeType} onChange={e => setForm({ ...form, assigneeType: e.target.value, assigneeUserId: "", assigneeDepartmentId: "" })}>
            <option value="User">Assign to User</option>
            <option value="Department">Assign to Department</option>
          </select>
          {form.assigneeType === "User"
            ? <select required className={sel} value={form.assigneeUserId} onChange={e => setForm({ ...form, assigneeUserId: e.target.value })}><option value="">Select user...</option>{users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select>
            : <select required className={sel} value={form.assigneeDepartmentId} onChange={e => setForm({ ...form, assigneeDepartmentId: e.target.value })}><option value="">Select department...</option>{depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select>}
          <div className="flex flex-col gap-1"><label className="text-[10px] text-zinc-400 uppercase">Expected Return (optional)</label><input type="date" className={sel} value={form.expectedReturnDate} onChange={e => setForm({ ...form, expectedReturnDate: e.target.value })} /></div>
          <button type="submit" className="col-span-2 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 text-xs">Allocate</button>
        </form>

        {conflict && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-2">
            <p className="text-amber-800 font-medium">{conflict.error || "Asset already allocated."} — Request a transfer instead?</p>
            {!showTransfer
              ? <button onClick={() => setShowTransfer(true)} className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700">Request Transfer</button>
              : <div className="space-y-2"><input placeholder="Reason for transfer..." className={sel} value={transferReason} onChange={e => setTransferReason(e.target.value)} /><div className="flex gap-2"><button onClick={handleTransfer} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Submit Transfer</button><button onClick={() => setShowTransfer(false)} className="px-3 py-1 border border-zinc-300 rounded bg-white">Cancel</button></div></div>}
          </div>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded">
        <div className="px-4 py-3 border-b border-zinc-100"><span className="text-sm font-bold text-zinc-900">Pending Transfer Requests</span></div>
        {transfers.length === 0
          ? <div className="px-4 py-4 text-xs text-zinc-400">No pending transfers.</div>
          : <table className="w-full text-xs"><thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500"><tr><th className="px-4 py-2 text-left">Asset</th><th className="px-4 py-2 text-left">Requested By</th><th className="px-4 py-2 text-left">Target</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">{transfers.map(t => (
              <tr key={t._id} className="hover:bg-zinc-50">
                <td className="px-4 py-2.5 font-medium">{t.asset?.name}</td>
                <td className="px-4 py-2.5 text-zinc-600">{t.requestedBy?.name}</td>
                <td className="px-4 py-2.5 text-zinc-600">{t.targetUser?.name || t.targetDepartment?.name || "—"}</td>
                <td className="px-4 py-2.5"><StatusBadge value={t.status} /></td>
                <td className="px-4 py-2.5 text-right space-x-2">
                  <button onClick={async () => { await approveTransfer(t._id); load(); }} className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Approve</button>
                  <button onClick={async () => { await rejectTransfer(t._id); load(); }} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                </td>
              </tr>
            ))}</tbody></table>}
      </div>
    </div>
  );
}
