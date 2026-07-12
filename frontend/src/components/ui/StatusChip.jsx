import { useEffect, useState } from 'react';

// Maps status strings to Tailwind color classes
const STATUS_COLORS = {
  // Assets
  Available: 'text-status-available bg-status-available/10 border-status-available/20',
  Allocated: 'text-status-allocated bg-status-allocated/10 border-status-allocated/20',
  UnderMaintenance: 'text-status-maintenance bg-status-maintenance/10 border-status-maintenance/20',
  Reserved: 'text-status-reserved bg-status-reserved/10 border-status-reserved/20',
  Retired: 'text-status-inactive bg-status-inactive/10 border-status-inactive/20',
  Disposed: 'text-status-inactive bg-status-inactive/10 border-status-inactive/20',
  // Transfers & Maintenance
  Requested: 'text-status-reserved bg-status-reserved/10 border-status-reserved/20',
  Pending: 'text-status-allocated bg-status-allocated/10 border-status-allocated/20',
  Approved: 'text-status-available bg-status-available/10 border-status-available/20',
  Rejected: 'text-status-maintenance bg-status-maintenance/10 border-status-maintenance/20',
  TechnicianAssigned: 'text-status-reserved bg-status-reserved/10 border-status-reserved/20',
  InProgress: 'text-status-allocated bg-status-allocated/10 border-status-allocated/20',
  Resolved: 'text-status-available bg-status-available/10 border-status-available/20',
  // Allocations & Bookings
  Active: 'text-status-available bg-status-available/10 border-status-available/20',
  Returned: 'text-status-inactive bg-status-inactive/10 border-status-inactive/20',
  Upcoming: 'text-status-allocated bg-status-allocated/10 border-status-allocated/20',
  Ongoing: 'text-status-available bg-status-available/10 border-status-available/20',
  Completed: 'text-status-inactive bg-status-inactive/10 border-status-inactive/20',
  Cancelled: 'text-status-inactive bg-status-inactive/10 border-status-inactive/20',
};

const DOT_COLORS = {
  Available: 'bg-status-available',
  Allocated: 'bg-status-allocated',
  UnderMaintenance: 'bg-status-maintenance',
  Reserved: 'bg-status-reserved',
  Retired: 'bg-status-inactive',
  Disposed: 'bg-status-inactive',
  Requested: 'bg-status-reserved',
  Pending: 'bg-status-allocated',
  Approved: 'bg-status-available',
  Rejected: 'bg-status-maintenance',
  TechnicianAssigned: 'bg-status-reserved',
  InProgress: 'bg-status-allocated',
  Resolved: 'bg-status-available',
  Active: 'bg-status-available',
  Returned: 'bg-status-inactive',
  Upcoming: 'bg-status-allocated',
  Ongoing: 'bg-status-available',
  Completed: 'bg-status-inactive',
  Cancelled: 'bg-status-inactive',
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
