import React, { useState, useEffect } from 'react';
import { getAllocations, getMaintenanceRequests, createMaintenanceRequest } from './api';
import StatusBadge from './StatusBadge';
import { MAINTENANCE_PRIORITIES } from './constants';

export default function Maintenance() {
  const [allocations, setAllocations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [asset, setAsset] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(MAINTENANCE_PRIORITIES[0]);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      const [aRes, mRes] = await Promise.all([getAllocations(), getMaintenanceRequests()]);
      setAllocations(aRes.data.filter(a => a.status === 'Active'));
      setRequests(mRes.data);
    } catch {
      // silent; list will just be empty
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await createMaintenanceRequest({ asset, description, priority, attachmentUrl });
      setAsset(''); setDescription(''); setPriority(MAINTENANCE_PRIORITIES[0]);
      setAttachmentUrl('');
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Submission failed.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-xs text-zinc-500 p-4">Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Maintenance Requests</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded px-4 py-2.5 space-y-2">
        <p className="text-xs font-semibold text-zinc-700">New Request</p>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Asset</label>
          <select required value={asset} onChange={e => setAsset(e.target.value)}
            className="text-xs border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
            <option value="">Select asset...</option>
            {allocations.map(a => (
              <option key={a._id} value={a.asset._id}>
                {a.asset.name} ({a.asset.assetTag})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Description</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)}
            rows={3} placeholder="Describe the issue..."
            className="text-xs border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="text-xs border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
              {MAINTENANCE_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Attachment URL</label>
            <input type="url" value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)}
              placeholder="Attachment URL (optional)"
              className="text-xs border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
        </div>

        {formError && <p className="text-xs text-red-600">{formError}</p>}
        <button type="submit" disabled={submitting}
          className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {/* Past Requests */}
      <div className="bg-white border border-zinc-200 rounded overflow-hidden">
        <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 grid grid-cols-5 gap-2">
          <span className="text-xs font-semibold text-zinc-600">Asset</span>
          <span className="text-xs font-semibold text-zinc-600 col-span-2">Description</span>
          <span className="text-xs font-semibold text-zinc-600">Priority</span>
          <span className="text-xs font-semibold text-zinc-600">Status / Date</span>
        </div>
        {requests.length === 0
          ? <p className="text-xs text-zinc-400 px-4 py-2.5">No maintenance requests yet.</p>
          : requests.map(r => (
            <div key={r._id} className="px-4 py-2.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 grid grid-cols-5 gap-2 items-center">
              <span className="text-xs text-zinc-700">{r.asset?.name}</span>
              <span className="text-xs text-zinc-500 col-span-2 truncate" title={r.description}>{r.description}</span>
              <StatusBadge value={r.priority} />
              <div className="flex flex-col gap-0.5">
                <StatusBadge value={r.status} />
                <span className="text-[10px] text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
