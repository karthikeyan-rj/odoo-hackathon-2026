import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import StatusChip from '../../components/ui/StatusChip';
import DataTable from '../../components/ui/DataTable';
import { useSocket } from '../../contexts/SocketContext';

export default function AssetDetailPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchData = async () => {
    try {
      const [assetRes, timelineRes] = await Promise.all([
        api.get(`/assets/${id}`),
        api.get(`/assets/${id}/history`)
      ]);
      setAsset(assetRes.data.data);
      setTimeline(timelineRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data) => {
      // Check if update relates to this asset
      if (
        (data.allocation && data.allocation.asset === id) ||
        (data.assetId === id) ||
        (data.transferRequest && data.transferRequest.asset._id === id) ||
        (data.requestId && true) // would need more context for maintenance
      ) {
        fetchData();
      } else {
        // Just refetching on any relevant event to ensure accuracy
        fetchData();
      }
    };
    
    socket.on('allocation:created', handleUpdate);
    socket.on('allocation:returned', handleUpdate);
    socket.on('transfer:approved', handleUpdate);
    socket.on('maintenance:statusChanged', handleUpdate);

    return () => {
      socket.off('allocation:created', handleUpdate);
      socket.off('allocation:returned', handleUpdate);
      socket.off('transfer:approved', handleUpdate);
      socket.off('maintenance:statusChanged', handleUpdate);
    };
  }, [socket, id]);

  if (loading) {
    return <div className="p-8 text-ink-muted">Loading asset details...</div>;
  }

  if (!asset) {
    return <div className="p-8 text-red-600">Asset not found.</div>;
  }

  const timelineColumns = [
    { header: 'Action', accessor: 'action', className: 'font-medium' },
    { header: 'User', render: (row) => row.user?.name || 'System' },
    { header: 'Details', render: (row) => row.details?.notes || '-' },
    { header: 'Timestamp', render: (row) => new Date(row.timestamp).toLocaleString() }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade_in">
      <Link to="/assets" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">
        ← Back to Registry
      </Link>
      
      <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink mb-1">{asset.name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono font-medium text-accent">{asset.assetTag}</span>
              <span className="text-ink-muted">•</span>
              <span className="text-ink-muted">{asset.category?.name || 'Uncategorized'}</span>
              <span className="text-ink-muted">•</span>
              <span className="text-ink-muted">{asset.serialNumber || 'No SN'}</span>
            </div>
          </div>
          <StatusChip status={asset.status} pulse />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/50 pt-6">
          <div>
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Current Assignment</h3>
            {asset.currentAllocation ? (
              <div className="bg-bg rounded-lg p-4">
                <div className="font-medium">{asset.currentAllocation.assignee?.name || 'Unknown'}</div>
                <div className="text-sm text-ink-muted mt-1">Assigned by {asset.currentAllocation.allocatedBy?.name}</div>
              </div>
            ) : (
              <div className="text-sm text-ink-muted italic">Not currently allocated</div>
            )}
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Asset Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Bookable</span><span>{asset.isBookable ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Created</span><span>{new Date(asset.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-ink mb-4">Activity Timeline</h2>
        <DataTable columns={timelineColumns} data={timeline} emptyMessage="No activity recorded yet." />
      </div>
    </div>
  );
}
