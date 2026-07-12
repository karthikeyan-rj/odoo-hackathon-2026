import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatusChip from '../../components/ui/StatusChip';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookableAssets, setBookableAssets] = useState([]);
  
  const [formData, setFormData] = useState({
    resource: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    purpose: ''
  });

  useEffect(() => {
    fetchData();
    fetchBookableAssets();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    socket.on('booking:created', handleUpdate);
    socket.on('booking:cancelled', handleUpdate);
    return () => {
      socket.off('booking:created', handleUpdate);
      socket.off('booking:cancelled', handleUpdate);
    };
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookableAssets = async () => {
    try {
      const res = await api.get('/assets?isBookable=true');
      setBookableAssets(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      await api.post('/bookings', {
        resourceId: formData.resource,
        purpose: formData.purpose,
        startTime: startDateTime,
        endTime: endDateTime,
      });
      setBookingModalOpen(false);
      setFormData({ resource: '', startDate: '', startTime: '', endDate: '', endTime: '', purpose: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book resource');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const columns = [
    { header: 'Resource', render: (row) => <span className="font-medium">{row.resource?.name}</span> },
    { header: 'Requested By', render: (row) => row.requestedBy?.name },
    { header: 'Purpose', accessor: 'purpose', className: 'text-ink-muted text-sm max-w-xs truncate' },
    { header: 'Time Window', render: (row) => (
      <div className="text-xs">
        <div>{dayjs(row.startTime).format('MMM D, YYYY h:mm A')}</div>
        <div className="text-ink-muted">to {dayjs(row.endTime).format('h:mm A')}</div>
      </div>
    ) },
    { header: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { header: 'Actions', render: (row) => {
      if (row.status !== 'Upcoming') return null;
      const isOwner = row.requestedBy?._id === user?._id;
      const isAdmin = ['Admin', 'AssetManager'].includes(user?.role);
      
      if (isOwner || isAdmin) {
        return <button onClick={() => handleCancel(row._id)} className="text-status-maintenance text-sm font-medium hover:underline">Cancel</button>;
      }
      return null;
    }}
  ];

  // Helper to set min date to today
  const todayStr = dayjs().format('YYYY-MM-DD');

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade_in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Resource Bookings</h1>
          <p className="text-sm text-ink-muted mt-1">Schedule time for conference rooms, projectors, and shared equipment.</p>
        </div>
        <button onClick={() => setBookingModalOpen(true)} className="btn bg-accent text-white hover:bg-accent-hover px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
          Book Resource
        </button>
      </div>

      <DataTable columns={columns} data={bookings} loading={loading} emptyMessage="No active or upcoming bookings." />

      <Modal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} title="Book Resource">
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Select Resource</label>
            <select required value={formData.resource} onChange={(e) => setFormData({...formData, resource: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm">
              <option value="" disabled>-- Available Resources --</option>
              {bookableAssets.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-ink">Start</label>
              <input required type="date" min={todayStr} value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" />
              <input required type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-ink">End</label>
              <input required type="date" min={formData.startDate || todayStr} value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" />
              <input required type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Purpose</label>
            <textarea required rows={3} value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="w-full rounded-lg border-border bg-surface px-4 py-2 outline-none focus:border-accent text-sm" placeholder="Briefly describe the purpose of this booking..."></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setBookingModalOpen(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-bg rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm">Confirm Booking</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
