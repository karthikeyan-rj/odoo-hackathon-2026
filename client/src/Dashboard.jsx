import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function Dashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [alloc, setAlloc] = useState([]);
  const [books, setBooks] = useState([]);
  const [maint, setMaint] = useState([]);
  const [assets, setAssets] = useState([]);
  const [msg, setMsg] = useState("");
  const [mf, setMf] = useState({ asset: "", description: "", priority: "Medium" });
  const [bf, setBf] = useState({ resource: "", date: "", start: "", end: "", purpose: "" });

  const load = () => Promise.all([
    api.get("/api/allocations").then(r => setAlloc(r.data)),
    api.get("/api/bookings").then(r => setBooks(r.data)),
    api.get("/api/maintenance").then(r => setMaint(r.data)),
    api.get("/api/assets", { params: { isBookable: true } }).then(r => setAssets(r.data)),
  ]).catch(e => setMsg("API error — is the server running?"));

  useEffect(() => { load(); }, []);

  const logout = () => { localStorage.clear(); nav("/login"); };
  const err = (e) => setMsg(e.response?.data?.error || "Request failed");

  const doReturn = async id => { try { await api.post(`/api/allocations/${id}/return`, { returnConditionNotes: "" }); load(); } catch(e) { err(e); } };
  const doMaint = async e => { e.preventDefault(); try { await api.post("/api/maintenance", mf); setMf({ asset: "", description: "", priority: "Medium" }); load(); } catch(ex) { err(ex); } };
  const doBook = async e => {
    e.preventDefault();
    try {
      await api.post("/api/bookings", { resource: bf.resource, purpose: bf.purpose, startTime: new Date(`${bf.date}T${bf.start}`).toISOString(), endTime: new Date(`${bf.date}T${bf.end}`).toISOString() });
      setBf({ resource: "", date: "", start: "", end: "", purpose: "" }); load();
    } catch(ex) { err(ex); }
  };

  const active = alloc.filter(a => a.status === "Active");
  const overdue = active.filter(a => a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date()).length;
  const inp = "w-full p-2 border border-zinc-200 rounded bg-white text-xs";
  const btn = "w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 text-xs";

  return (
    <div className="space-y-5">
      {msg && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{msg} <button onClick={() => setMsg("")} className="ml-2 font-bold">×</button></div>}

        <div className="grid grid-cols-4 gap-4">
          {[["Active Allocations", active.length, false], ["Upcoming Bookings", books.filter(b => b.status === "Upcoming").length, false], ["Pending Maintenance", maint.filter(m => m.status === "Pending").length, false], ["Overdue Returns", overdue, overdue > 0]].map(([l, v, warn]) => (
            <div key={l} className="bg-white border border-zinc-200 rounded p-4"><div className={`text-2xl font-bold ${warn ? "text-red-600" : "text-zinc-900"}`}>{v}</div><div className="text-[10px] text-zinc-400 uppercase mt-1">{l}</div></div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5 items-start">
          <div className="col-span-2 space-y-4">
            {[
              { title: "My Assets", rows: active, render: a => <><span className="font-medium">{a.asset?.name}</span><span className="ml-2 font-mono text-zinc-400">{a.asset?.assetTag}</span>{a.expectedReturnDate && <span className={`ml-2 ${new Date(a.expectedReturnDate) < new Date() ? "text-red-600 font-semibold" : "text-zinc-400"}`}>Due {new Date(a.expectedReturnDate).toLocaleDateString()}</span>}<button onClick={() => doReturn(a._id)} className="ml-auto px-2 py-0.5 border border-zinc-300 rounded hover:bg-zinc-50">Return</button></> },
              { title: "My Bookings", rows: books, render: b => <><span>{b.resource?.name}</span><span className="ml-2 text-zinc-400">{new Date(b.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })} → {new Date(b.endTime).toLocaleTimeString([], { timeStyle: "short" })}</span><span className="ml-auto font-semibold text-blue-600">{b.status}</span></> },
              { title: "Maintenance Requests", rows: maint, render: m => <><span className="font-medium">{m.asset?.name}</span><span className="ml-2 text-zinc-400 truncate max-w-xs">{m.description}</span><span className={`ml-auto font-semibold ${m.priority === "Critical" ? "text-red-600" : m.priority === "High" ? "text-orange-600" : "text-zinc-500"}`}>[{m.priority}]</span><span className="ml-2 font-semibold">{m.status}</span></> },
            ].map(({ title, rows, render }) => (
              <div key={title} className="bg-white border border-zinc-200 rounded">
                <div className="px-4 py-2.5 border-b border-zinc-100 font-semibold text-zinc-800">{title}</div>
                {rows.length === 0 ? <div className="px-4 py-4 text-zinc-400">No records.</div> : rows.map(r => <div key={r._id} className="px-4 py-2.5 flex items-center gap-2 border-b border-zinc-50 last:border-0">{render(r)}</div>)}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <form onSubmit={doBook} className="bg-white border border-zinc-200 rounded p-4 space-y-2">
              <h3 className="font-semibold border-b border-zinc-100 pb-2 text-zinc-800">Book Resource</h3>
              <select required className={inp} value={bf.resource} onChange={e => setBf({ ...bf, resource: e.target.value })}><option value="">Select resource...</option>{assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}</select>
              <input type="date" required min={new Date().toISOString().split("T")[0]} className={inp} value={bf.date} onChange={e => setBf({ ...bf, date: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input type="time" required className={inp} value={bf.start} onChange={e => setBf({ ...bf, start: e.target.value })} />
                <input type="time" required className={inp} value={bf.end} onChange={e => setBf({ ...bf, end: e.target.value })} />
              </div>
              <input type="text" placeholder="Purpose" required className={inp} value={bf.purpose} onChange={e => setBf({ ...bf, purpose: e.target.value })} />
              <button type="submit" className={btn}>Confirm Booking</button>
            </form>

            <form onSubmit={doMaint} className="bg-white border border-zinc-200 rounded p-4 space-y-2">
              <h3 className="font-semibold border-b border-zinc-100 pb-2 text-zinc-800">Raise Maintenance</h3>
              <select required className={inp} value={mf.asset} onChange={e => setMf({ ...mf, asset: e.target.value })}><option value="">Select asset...</option>{active.map(a => <option key={a._id} value={a.asset?._id}>{a.asset?.name} ({a.asset?.assetTag})</option>)}</select>
              <textarea placeholder="Describe the issue..." required rows="3" className={`${inp} resize-none`} value={mf.description} onChange={e => setMf({ ...mf, description: e.target.value })} />
              <select className={inp} value={mf.priority} onChange={e => setMf({ ...mf, priority: e.target.value })}>{["Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}</select>
              <button type="submit" className={btn}>Submit Ticket</button>
            </form>
          </div>
        </div>
    </div>
  );
}
