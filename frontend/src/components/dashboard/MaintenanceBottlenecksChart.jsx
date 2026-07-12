import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import api from '../../lib/api';
import { useSocket } from '../../contexts/SocketContext';
import { STATUS_HEX, statusLabel } from '../../lib/statusColors';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';

// Pipeline order, not alphabetical — reads left-to-right as the request's actual lifecycle.
const PIPELINE_ORDER = ['Pending', 'Approved', 'TechnicianAssigned', 'InProgress', 'Resolved', 'Rejected'];

export default function MaintenanceBottlenecksChart() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchData = () => {
    api.get('/dashboard/maintenance-summary')
      .then((res) => setRows(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    socket.on('maintenance:statusChanged', handleUpdate);
    return () => socket.off('maintenance:statusChanged', handleUpdate);
  }, [socket]);

  const data = useMemo(() => {
    const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.count]));
    return PIPELINE_ORDER.filter((s) => s in byStatus).map((status) => ({ status, count: byStatus[status] }));
  }, [rows]);

  const total = useMemo(() => data.reduce((sum, r) => sum + r.count, 0), [data]);

  return (
    <ChartCard
      title="Maintenance Bottlenecks"
      subtitle="Requests grouped by pipeline stage"
      isLoading={loading}
      isEmpty={!loading && total === 0}
      emptyMessage="No maintenance requests yet."
      skeletonVariant="bars"
      emptyIcon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      }
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="status"
            tickFormatter={statusLabel}
            width={110}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} formatter={(value, name) => [value, statusLabel(name)]} cursor={{ fill: 'var(--bg)' }} />
          <Bar
            dataKey="count"
            radius={[4, 4, 4, 4]}
            barSize={16}
            background={{ fill: 'var(--bg)', radius: 4 }}
            isAnimationActive={true}
            animationDuration={500}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={STATUS_HEX[entry.status] || '#94A3B8'} />
            ))}
            <LabelList dataKey="count" position="right" style={{ fill: 'var(--ink-muted)', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
