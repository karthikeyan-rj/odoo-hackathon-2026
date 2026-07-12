import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api, { getAssets, createAsset, getAssetHistory } from "./api";
import StatusBadge from "./StatusBadge";
import { ASSET_CONDITIONS, ASSET_STATUSES } from "./constants";

export default function AssetDirectory() {
  const location = useLocation();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [history, setHistory] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", serialNumber: "", acquisitionDate: "", acquisitionCost: "", condition: "Good", location: "", isBookable: false });

  const loadAssets = () => {
    setLoading(true);
    Promise.all([
      getAssets({ status: filterStatus || undefined, category: filterCategory || undefined }).then(r => setAssets(r.data || [])),
      api.get("/api/categories").then(r => setCategories(r.data || []))
    ]).catch(() => setMsg("Failed to load assets.")).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssets();
  }, [filterStatus, filterCategory]);

  useEffect(() => {
    if (location.state?.openForm) {
      setShowForm(true);
    }
  }, [location.state]);

  const handleRowClick = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!history[id]) {
      try {
        const r = await getAssetHistory(id);
        setHistory(prev => ({ ...prev, [id]: r.data }));
      } catch { setHistory(prev => ({ ...prev, [id]: [] })); }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAsset(form);
      setMsg("Asset registered."); setShowForm(false);
      setForm({ name: "", category: "", serialNumber: "", acquisitionDate: "", acquisitionCost: "", condition: "Good", location: "", isBookable: false });
      loadAssets();
    } catch (err) { setMsg(err.response?.data?.error || "Registration failed."); }
  };

  const displayed = assets.filter(a =>
    !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.assetTag?.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full p-2 border border-zinc-200 rounded bg-white text-xs";

  if (loading) return <div className="text-xs text-zinc-500">Loading assets...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-zinc-900">Asset Directory</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-700">
          {showForm ? "Cancel" : "+ Register Asset"}
        </button>
      </div>

      {msg && <div className="p-2.5 bg-zinc-100 border border-zinc-200 rounded text-xs flex justify-between">{msg}<button onClick={() => setMsg("")} className="font-bold">×</button></div>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-zinc-200 rounded p-4 grid grid-cols-3 gap-3">
          <input required placeholder="Name" className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <select required className={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="">Category...</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input placeholder="Serial Number" className={inp} value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} />
          <input type="date" className={inp} value={form.acquisitionDate} onChange={e => setForm({ ...form, acquisitionDate: e.target.value })} />
          <input type="number" placeholder="Cost" className={inp} value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: e.target.value })} />
          <input placeholder="Location" className={inp} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <select className={inp} value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
            {ASSET_CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs text-zinc-700 col-span-1">
            <input type="checkbox" checked={form.isBookable} onChange={e => setForm({ ...form, isBookable: e.target.checked })} /> Bookable
          </label>
          <button type="submit" className="py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 text-xs">Register</button>
        </form>
      )}

      <div className="flex gap-3">
        <input placeholder="Search name or tag..." className="flex-1 p-2 border border-zinc-200 rounded bg-white text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="p-2 border border-zinc-200 rounded bg-white text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {ASSET_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="p-2 border border-zinc-200 rounded bg-white text-xs" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {displayed.length === 0 ? (
        <div className="p-4 bg-white border border-zinc-200 rounded text-xs text-zinc-500">No assets found.</div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-left">Tag</th>
                <th className="px-4 py-2.5 text-left">Category</th>
                <th className="px-4 py-2.5 text-left">Condition</th>
                <th className="px-4 py-2.5 text-left">Location</th>
                <th className="px-4 py-2.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {displayed.map(a => (
                <React.Fragment key={a._id}>
                  <tr className="hover:bg-zinc-50 cursor-pointer" onClick={() => handleRowClick(a._id)}>
                    <td className="px-4 py-2.5 font-medium text-zinc-900">{a.name}</td>
                    <td className="px-4 py-2.5 font-mono text-zinc-500">{a.assetTag}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{a.category?.name}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{a.condition}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{a.location}</td>
                    <td className="px-4 py-2.5"><StatusBadge value={a.status} /></td>
                  </tr>
                  {expandedId === a._id && (
                    <tr className="bg-zinc-50"><td colSpan="6" className="px-4 py-3">
                      <div className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">History</div>
                      {!history[a._id] ? <div className="text-xs text-zinc-400">Loading...</div>
                        : history[a._id].length === 0 ? <div className="text-xs text-zinc-400">No history on record.</div>
                        : <div className="space-y-1">{history[a._id].map((h, i) => (
                            <div key={i} className="text-xs text-zinc-600">{h.type} — {h.description} <span className="text-zinc-400">{new Date(h.date || h.createdAt).toLocaleDateString()}</span></div>
                          ))}</div>}
                    </td></tr>
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
