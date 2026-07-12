import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../lib/api';
import { useSocket } from '../../contexts/SocketContext';
import { STATUS_HEX, statusLabel } from '../../lib/statusColors';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';

const REFETCH_EVENTS = ['allocation:created', 'allocation:returned', 'transfer:approved', 'maintenance:statusChanged'];

export default function AssetUtilizationChart() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchData = () => {
    api.get('/dashboard/utilization')
      .then((res) => setRows(res.data.data))
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

  const data = useMemo(() => rows.filter((r) => r.count > 0), [rows]);
  const total = useMemo(() => rows.reduce((sum, r) => sum + r.count, 0), [rows]);

  return (
    <ChartCard
      title="Asset Utilization"
      subtitle="Assets grouped by current status"
      isLoading={loading}
      isEmpty={!loading && total === 0}
      emptyMessage="No assets registered yet."
      skeletonVariant="donut"
      emptyIcon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      }
    >
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
              isAnimationActive={true}
              animationDuration={500}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_HEX[entry.status] || '#94A3B8'} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} formatter={(value, name) => [value, statusLabel(name)]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-mono font-bold text-ink">{total}</span>
          <span className="text-2xs text-ink-muted uppercase tracking-wider">Assets</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3 pt-4 border-t border-border/50">
        {data.map((entry) => (
          <div key={entry.status} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_HEX[entry.status] || '#94A3B8' }} />
            <span className="text-ink-muted">{statusLabel(entry.status)}</span>
            <span className="font-mono font-semibold text-ink">{entry.count}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
