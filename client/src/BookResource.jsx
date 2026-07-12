import React, { useState, useEffect } from 'react';
import { getBookableAssets, getBookings, createBooking } from './api';
import StatusBadge from './StatusBadge';

export default function BookResource() {
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getBookableAssets(), getBookings()])
      .then(([aRes, bRes]) => {
        setAssets(aRes.data);
        setBookings(bRes.data);
      })
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const startISO = new Date(`${date}T${startTime}`).toISOString();
      const endISO = new Date(`${date}T${endTime}`).toISOString();
      await createBooking({ resource: selected._id, startTime: startISO, endTime: endISO, purpose });
      const bRes = await getBookings();
      setBookings(bRes.data);
      setDate(''); setStartTime(''); setEndTime(''); setPurpose('');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Booking failed.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-xs text-zinc-500 p-4">Loading resources...</p>;
  if (error) return <div className="m-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">{error}</div>;
  if (assets.length === 0) return (
    <div className="m-4 px-4 py-2.5 bg-white border border-zinc-200 rounded text-xs text-zinc-500">
      No bookable resources available.
    </div>
  );

  const upcomingBookings = selected
    ? bookings.filter(b => (b.resource?._id || b.resource) === selected._id && b.status === 'Upcoming')
    : [];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Book a Resource</h2>

      <div className="grid grid-cols-3 gap-3">
        {assets.map(asset => (
          <button
            key={asset._id}
            onClick={() => { setSelected(asset); setFormError(''); }}
            className={`text-left bg-white border border-zinc-200 rounded px-4 py-2.5 hover:bg-zinc-50 transition-all
              ${selected?._id === asset._id ? 'ring-2 ring-blue-500' : ''}`}
          >
            <p className="text-xs font-semibold text-zinc-800">{asset.name}</p>
            <p className="text-xs text-zinc-500">{asset.assetTag}</p>
            <p className="text-xs text-zinc-400">{asset.location}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="bg-white border border-zinc-200 rounded px-4 py-2.5">
            <p className="text-xs font-semibold text-zinc-700 mb-2">Upcoming Bookings for {selected.name}</p>
            {upcomingBookings.length === 0
              ? <p className="text-xs text-zinc-400">No upcoming bookings.</p>
              : upcomingBookings.map(b => (
                <div key={b._id} className="flex items-center justify-between py-1 border-b border-zinc-100 last:border-0">
                  <span className="text-xs text-zinc-600">
                    {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}
                  </span>
                  <StatusBadge value={b.status} />
                </div>
              ))
            }
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded px-4 py-2.5 space-y-2">
            <p className="text-xs font-semibold text-zinc-700">New Booking</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Date</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                  className="text-xs border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Start Time</label>
                <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="text-xs border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">End Time</label>
                <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="text-xs border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Purpose</label>
              <input type="text" required value={purpose} onChange={e => setPurpose(e.target.value)}
                placeholder="Purpose of booking"
                className="text-xs border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <button type="submit" disabled={submitting}
              className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Booking...' : 'Book Resource'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
