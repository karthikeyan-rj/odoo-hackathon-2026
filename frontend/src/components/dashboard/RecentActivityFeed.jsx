import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { useSocket } from '../../contexts/SocketContext';
import ChartCard from './ChartCard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ACTION_LABELS = {
  ALLOCATE_ASSET: 'allocated an asset',
  RETURN_ASSET: 'returned an asset',
  REQUEST_TRANSFER: 'requested a transfer',
  APPROVE_TRANSFER: 'approved a transfer',
  REJECT_TRANSFER: 'rejected a transfer',
  CREATE_BOOKING: 'booked a resource',
  CANCEL_BOOKING: 'cancelled a booking',
  RAISE_MAINTENANCE_REQUEST: 'raised a maintenance request',
  APPROVE_MAINTENANCE_REQUEST: 'approved a maintenance request',
  REJECT_MAINTENANCE_REQUEST: 'rejected a maintenance request',
  RESOLVE_MAINTENANCE_REQUEST: 'resolved a maintenance request',
};

const REFETCH_EVENTS = [
  'allocation:created', 'allocation:returned',
  'transfer:requested', 'transfer:approved', 'transfer:rejected',
  'booking:created', 'booking:cancelled',
  'maintenance:statusChanged',
];

function actionLabel(action) {
  return ACTION_LABELS[action] || action.replace(/_/g, ' ').toLowerCase();
}

export default function RecentActivityFeed() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pulseId, setPulseId] = useState(null);
  const socket = useSocket();
  const topIdRef = useRef(null);

  const fetchData = () => {
    api.get('/dashboard/recent-activity')
      .then((res) => {
        const data = res.data.data;
        const newTopId = data[0]?._id;
        if (topIdRef.current && newTopId && newTopId !== topIdRef.current) {
          setPulseId(newTopId);
          setTimeout(() => setPulseId(null), 1200);
        }
        topIdRef.current = newTopId;
        setEntries(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    REFETCH_EVENTS.forEach((evt) => socket.on(evt, handleUpdate));
    return () => REFETCH_EVENTS.forEach((evt) => socket.off(evt, handleUpdate));
  }, [socket]);

  return (
    <ChartCard
      title="Recent Activity"
      subtitle="Live feed of the last 10 actions"
      isLoading={loading}
      isEmpty={!loading && entries.length === 0}
      emptyMessage="No activity yet."
      skeletonVariant="feed"
      emptyIcon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
    >
      <div className="divide-y divide-border/60">
        {entries.map((entry) => {
          const isNew = entry._id === pulseId;
          return (
            <div key={entry._id} className={`flex items-start gap-3 py-3 first:pt-0 last:pb-0 transition-colors duration-500 ${isNew ? 'row-flash' : ''}`}>
              <div className={`mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0 ${isNew ? 'pulse-dot' : ''}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink leading-snug">
                  <span className="font-semibold">{entry.actor?.name || 'System'}</span>{' '}
                  <span className="text-ink-muted">{actionLabel(entry.action)}</span>
                  {entry.details?.assetTag && (
                    <span className="font-mono text-accent ml-1.5">{entry.details.assetTag}</span>
                  )}
                </p>
              </div>
              <span className="text-xs text-ink-muted whitespace-nowrap font-mono shrink-0">
                {dayjs(entry.createdAt).fromNow()}
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
