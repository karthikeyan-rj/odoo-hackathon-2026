import { useEffect, useState } from 'react';

// Maps status strings to Tailwind color classes
const STATUS_COLORS = {
  // Assets
  Available: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]',
  Allocated: 'text-amber-700 bg-amber-500/10 border-amber-500/20 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)]',
  UnderMaintenance: 'text-rose-700 bg-rose-500/10 border-rose-500/20 shadow-[inset_0_0_8px_rgba(244,63,94,0.15)]',
  Reserved: 'text-blue-700 bg-blue-500/10 border-blue-500/20 shadow-[inset_0_0_8px_rgba(59,130,246,0.15)]',
  Retired: 'text-slate-600 bg-slate-500/10 border-slate-500/20 shadow-[inset_0_0_8px_rgba(100,116,139,0.15)]',
  Disposed: 'text-slate-600 bg-slate-500/10 border-slate-500/20 shadow-[inset_0_0_8px_rgba(100,116,139,0.15)]',
  // Transfers & Maintenance
  Requested: 'text-blue-700 bg-blue-500/10 border-blue-500/20 shadow-[inset_0_0_8px_rgba(59,130,246,0.15)]',
  Pending: 'text-amber-700 bg-amber-500/10 border-amber-500/20 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)]',
  Approved: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]',
  Rejected: 'text-rose-700 bg-rose-500/10 border-rose-500/20 shadow-[inset_0_0_8px_rgba(244,63,94,0.15)]',
  TechnicianAssigned: 'text-blue-700 bg-blue-500/10 border-blue-500/20 shadow-[inset_0_0_8px_rgba(59,130,246,0.15)]',
  InProgress: 'text-amber-700 bg-amber-500/10 border-amber-500/20 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)]',
  Resolved: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]',
  // Allocations & Bookings
  Active: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]',
  Returned: 'text-slate-600 bg-slate-500/10 border-slate-500/20 shadow-[inset_0_0_8px_rgba(100,116,139,0.15)]',
  Upcoming: 'text-amber-700 bg-amber-500/10 border-amber-500/20 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)]',
  Ongoing: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]',
  Completed: 'text-slate-600 bg-slate-500/10 border-slate-500/20 shadow-[inset_0_0_8px_rgba(100,116,139,0.15)]',
  Cancelled: 'text-slate-600 bg-slate-500/10 border-slate-500/20 shadow-[inset_0_0_8px_rgba(100,116,139,0.15)]',
};

const DOT_COLORS = {
  Available: 'bg-emerald-500',
  Allocated: 'bg-amber-500',
  UnderMaintenance: 'bg-rose-500',
  Reserved: 'bg-blue-500',
  Retired: 'bg-slate-500',
  Disposed: 'bg-slate-500',
  Requested: 'bg-blue-500',
  Pending: 'bg-amber-500',
  Approved: 'bg-emerald-500',
  Rejected: 'bg-rose-500',
  TechnicianAssigned: 'bg-blue-500',
  InProgress: 'bg-amber-500',
  Resolved: 'bg-emerald-500',
  Active: 'bg-emerald-500',
  Returned: 'bg-slate-500',
  Upcoming: 'bg-amber-500',
  Ongoing: 'bg-emerald-500',
  Completed: 'bg-slate-500',
  Cancelled: 'bg-slate-500',
};

export default function StatusChip({ status, pulse = false }) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (pulse) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 600); // match animation duration
      return () => clearTimeout(timer);
    }
  }, [pulse, status]);

  const colorClass = STATUS_COLORS[status] || 'text-ink bg-surface border-border';
  const dotColor = DOT_COLORS[status] || 'bg-ink';

  // "Live Pulse" signature element
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isPulsing ? 'pulse-dot' : ''}`} />
      {status.replace(/([A-Z])/g, ' $1').trim()}
    </div>
  );
}
