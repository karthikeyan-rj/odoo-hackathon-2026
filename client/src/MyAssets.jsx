import React, { useState, useEffect } from "react";
import api, { getAllocations, returnAllocation, createTransfer } from "./api";
import StatusBadge from "./StatusBadge";

export default function MyAssets() {
  const [allocs, setAllocs] = useState([]);
  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  
  const [retId, setRetId] = useState("");
  const [notes, setNotes] = useState("");
  
  const [transId, setTransId] = useState("");
  const [transType, setTransType] = useState("User");
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getAllocations().then(r => setAllocs(r.data || [])),
      api.get("/api/users").then(r => setUsers(r.data || [])),
      api.get("/api/departments").then(r => setDepts(r.data || []))
    ]).catch(e => setMsg("Failed to load assets data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleReturn = async (id) => {
    try {
      await returnAllocation(id, notes);
      setMsg("Asset return initiated successfully.");
      setRetId(""); setNotes("");
      loadData();
    } catch (e) { setMsg(e.response?.data?.error || "Return failed."); }
  };

  const handleTransfer = async (id, assetId) => {
    try {
      await createTransfer({
        asset: assetId,
        targetType: transType,
        targetUser: transType === "User" ? target : undefined,
        targetDepartment: transType === "Department" ? target : undefined,
        reason
      });
      setMsg("Transfer request submitted.");
      setTransId(""); setTarget(""); setReason("");
    } catch (e) { setMsg(e.response?.data?.error || "Transfer failed."); }
  };

  if (loading) return <div className="p-4 text-xs">Loading allocations...</div>;
  if (allocs.length === 0) return <div className="p-4 text-xs text-zinc-500 bg-white border border-zinc-200 rounded">No active allocations found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h2 className="text-sm font-bold text-zinc-900">My Allocated Assets</h2></div>
      {msg && <div className="p-2.5 bg-zinc-100 border border-zinc-200 text-zinc-800 rounded flex justify-between">{msg}<button onClick={() => setMsg("")} className="font-bold">×</button></div>}
      
      <div className="bg-white border border-zinc-200 rounded overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] text-zinc-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-2.5">Asset</th>
              <th className="px-4 py-2.5">Tag</th>
              <th className="px-4 py-2.5">Condition</th>
              <th className="px-4 py-2.5">Allocated</th>
              <th className="px-4 py-2.5">Expected Return</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {allocs.map(a => {
              const isOverdue = a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();
              return (
                <React.Fragment key={a._id}>
                  <tr className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{a.asset?.name}</td>
                    <td className="px-4 py-3 font-mono text-zinc-500">{a.asset?.assetTag}</td>
                    <td className="px-4 py-3">{a.asset?.condition}</td>
                    <td className="px-4 py-3 text-zinc-500">{new Date(a.allocatedAt).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 ${isOverdue ? "text-red-600 font-semibold" : "text-zinc-500"}`}>
                      {a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge value={a.status} type="allocation" /></td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => { setRetId(retId === a._id ? "" : a._id); setTransId(""); }} className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">Return</button>
                      <button onClick={() => { setTransId(transId === a._id ? "" : a._id); setRetId(""); }} className="px-2 py-1 bg-zinc-900 text-white rounded hover:bg-zinc-800">Transfer</button>
                    </td>
                  </tr>
                  {retId === a._id && (
                    <tr className="bg-zinc-50"><td colSpan="7" className="px-4 py-3 space-y-2">
                      <textarea placeholder="Condition notes..." className="w-full p-2 border border-zinc-200 rounded text-xs" value={notes} onChange={e => setNotes(e.target.value)} />
                      <div className="flex gap-2"><button onClick={() => handleReturn(a._id)} className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Submit Return</button><button onClick={() => setRetId("")} className="px-3 py-1 border border-zinc-300 rounded bg-white">Cancel</button></div>
                    </td></tr>
                  )}
                  {transId === a._id && (
                    <tr className="bg-zinc-50"><td colSpan="7" className="px-4 py-3 space-y-2">
                      <div className="flex gap-4">
                        <select className="p-2 border border-zinc-200 rounded bg-white" value={transType} onChange={e => { setTransType(e.target.value); setTarget(""); }}>
                          <option value="User">User</option><option value="Department">Department</option>
                        </select>
                        <select className="p-2 border border-zinc-200 rounded bg-white flex-1" value={target} onChange={e => setTarget(e.target.value)}>
                          <option value="">Select Target...</option>
                          {transType === "User" ? users.map(u => <option key={u._id} value={u._id}>{u.name}</option>) : depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                      </div>
                      <input type="text" placeholder="Reason..." className="w-full p-2 border border-zinc-200 rounded text-xs" value={reason} onChange={e => setReason(e.target.value)} />
                      <div className="flex gap-2"><button onClick={() => handleTransfer(a._id, a.asset?._id)} className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Submit Transfer</button><button onClick={() => setTransId("")} className="px-3 py-1 border border-zinc-300 rounded bg-white">Cancel</button></div>
                    </td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
