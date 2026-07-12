import React, { useState, useEffect } from "react";
import { getAudits, createAuditCycle, getAuditDetails, updateAuditItem, closeAuditCycle, getDepartments, getUsers } from "./api";
import StatusBadge from "./StatusBadge";

export default function AssetAudits() {
  const [cycles, setCycles] = useState([]);
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [cycleItems, setCycleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [scopeDept, setScopeDept] = useState("");
  const [scopeLoc, setScopeLoc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAuditors, setSelectedAuditors] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      getAudits().then(r => setCycles(r.data || [])),
      getDepartments().then(r => setDepts(r.data || [])),
      getUsers().then(r => setUsers(r.data || []))
    ]).catch(() => setError("Failed to load audit configurations.")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSelectCycle = async (id) => {
    try {
      const res = await getAuditDetails(id);
      setSelectedCycle(res.data.cycle);
      setCycleItems(res.data.items || []);
      setMsg("");
    } catch (err) {
      setError("Failed to load audit cycle details.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAuditCycle({
        title,
        scopeDepartment: scopeDept || undefined,
        scopeLocation: scopeLoc || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        auditors: selectedAuditors,
      });
      setTitle(""); setScopeDept(""); setScopeLoc(""); setStartDate(""); setEndDate(""); setSelectedAuditors([]);
      setShowCreate(false);
      setMsg("Audit cycle created successfully!");
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create audit cycle.");
    }
  };

  const handleUpdateItem = async (itemId, result, notes) => {
    try {
      await updateAuditItem(selectedCycle._id, itemId, { result, notes });
      // Refresh items
      handleSelectCycle(selectedCycle._id);
      setMsg("Item updated.");
    } catch (err) {
      setError("Failed to update item.");
    }
  };

  const handleCloseCycle = async () => {
    if (!window.confirm("Are you sure you want to close this audit cycle? This will lock edits and update asset statuses.")) return;
    try {
      await closeAuditCycle(selectedCycle._id);
      setMsg("Audit cycle closed successfully. Asset statuses updated.");
      load();
      handleSelectCycle(selectedCycle._id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to close audit cycle.");
    }
  };

  const toggleAuditor = (userId) => {
    if (selectedAuditors.includes(userId)) {
      setSelectedAuditors(selectedAuditors.filter(id => id !== userId));
    } else {
      setSelectedAuditors([...selectedAuditors, userId]);
    }
  };

  const inp = "w-full p-2 border border-zinc-200 rounded bg-white text-xs";
  const btn = "px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-700 transition";

  if (loading) return <div className="text-xs text-zinc-500 p-4">Loading audit modules...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Asset Audit Cycles</h1>
        <p className="text-xs text-zinc-400">Schedule verification cycles, audit locations/departments, and review auto discrepancy reports.</p>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex justify-between">{error}<button onClick={() => setError("")} className="font-bold">×</button></div>}
      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs flex justify-between">{msg}<button onClick={() => setMsg("")} className="font-bold">×</button></div>}

      <div className="flex gap-4">
        {/* Left Side: Audit Cycles List */}
        <div className="w-1/3 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-zinc-800">Seeded Cycles</h3>
            <button onClick={() => setShowCreate(!showCreate)} className={btn}>
              {showCreate ? "Cancel" : "+ New Cycle"}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} className="bg-white border border-zinc-200 rounded p-4 space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-zinc-400 font-semibold mb-1">Cycle Title</label>
                <input required placeholder="Q3 Tech Audit" className={inp} value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-semibold mb-1">Scope Dept</label>
                  <select className={inp} value={scopeDept} onChange={e => setScopeDept(e.target.value)}>
                    <option value="">All Departments</option>
                    {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-semibold mb-1">Scope Location</label>
                  <input placeholder="Store Room" className={inp} value={scopeLoc} onChange={e => setScopeLoc(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-semibold mb-1">Start Date</label>
                  <input type="date" className={inp} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-semibold mb-1">End Date</label>
                  <input type="date" className={inp} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-zinc-400 font-semibold mb-1">Assign Auditors</label>
                <div className="max-h-24 overflow-y-auto border border-zinc-200 rounded p-2 bg-zinc-50 space-y-1">
                  {users.map(u => (
                    <label key={u._id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedAuditors.includes(u._id)} onChange={() => toggleAuditor(u._id)} className="rounded border-zinc-300" />
                      <span className="text-[10px] text-zinc-600">{u.name} ({u.role})</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs">
                Launch Audit Cycle
              </button>
            </form>
          )}

          <div className="bg-white border border-zinc-200 rounded overflow-hidden divide-y divide-zinc-100">
            {cycles.length === 0 ? (
              <div className="p-4 text-center text-zinc-400">No audits scheduled.</div>
            ) : (
              cycles.map(c => (
                <div key={c._id} onClick={() => handleSelectCycle(c._id)} className={`p-4 cursor-pointer hover:bg-zinc-50 transition ${selectedCycle?._id === c._id ? "bg-zinc-50 border-l-2 border-zinc-900" : ""}`}>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-zinc-800">{c.title}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-2">
                    Scope: {c.scopeDepartment?.name || "All Departments"} {c.scopeLocation && `(${c.scopeLocation})`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Selected Cycle Details / Items Checkoff */}
        <div className="flex-1">
          {selectedCycle ? (
            <div className="bg-white border border-zinc-200 rounded p-6 space-y-6">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">{selectedCycle.title}</h2>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Auditors: {selectedCycle.auditors?.map(a => a.name).join(", ") || "Unassigned"} | 
                    Status: <strong className="ml-1 text-zinc-700">{selectedCycle.status}</strong>
                  </div>
                </div>
                {selectedCycle.status === "Open" && (
                  <button onClick={handleCloseCycle} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold">
                    Close Audit & Apply Statuses
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-zinc-800">Cycle Inventory Check</h3>
                <div className="overflow-x-auto border border-zinc-200 rounded">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Asset</th>
                        <th className="px-4 py-2.5">Tag / Serial</th>
                        <th className="px-4 py-2.5">Location</th>
                        <th className="px-4 py-2.5">Result</th>
                        {selectedCycle.status === "Open" && <th className="px-4 py-2.5 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {cycleItems.map(item => (
                        <tr key={item._id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-zinc-900">{item.asset?.name}</div>
                            <div className="text-[10px] text-zinc-400">{item.asset?.category?.name}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px]">
                            <div>{item.asset?.assetTag}</div>
                            <div className="text-zinc-400">{item.asset?.serialNumber || "—"}</div>
                          </td>
                          <td className="px-4 py-3 text-zinc-600">{item.asset?.location || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.result === "Verified" ? "bg-emerald-50 text-emerald-700" :
                              item.result === "Missing" ? "bg-red-50 text-red-700" :
                              item.result === "Damaged" ? "bg-amber-50 text-amber-700" :
                              "bg-zinc-100 text-zinc-500"
                            }`}>
                              {item.result}
                            </span>
                          </td>
                          {selectedCycle.status === "Open" && (
                            <td className="px-4 py-3 text-right space-x-1">
                              <button onClick={() => handleUpdateItem(item._id, "Verified", "Verified in place")} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-medium">Verify</button>
                              <button onClick={() => handleUpdateItem(item._id, "Missing", "Not found")} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-medium">Missing</button>
                              <button onClick={() => handleUpdateItem(item._id, "Damaged", "Physical damage")} className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-medium">Damage</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Discrepancy report */}
              {selectedCycle.status === "Closed" && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                  <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[10px]">Auto-Generated Discrepancy Report</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
                      <div className="text-lg font-bold">{cycleItems.filter(i => i.result === "Verified").length}</div>
                      <div className="text-[9px] uppercase mt-1">Verified (Available)</div>
                    </div>
                    <div className="p-2 bg-red-50 text-red-700 border border-red-100 rounded">
                      <div className="text-lg font-bold">{cycleItems.filter(i => i.result === "Missing").length}</div>
                      <div className="text-[9px] uppercase mt-1">Missing (Flagged Lost)</div>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-700 border border-amber-100 rounded">
                      <div className="text-lg font-bold">{cycleItems.filter(i => i.result === "Damaged").length}</div>
                      <div className="text-[9px] uppercase mt-1">Damaged (Maintenance)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 border border-dashed border-zinc-200 rounded flex items-center justify-center text-zinc-400 text-xs">
              Select an audit cycle from the list to begin checking items.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
