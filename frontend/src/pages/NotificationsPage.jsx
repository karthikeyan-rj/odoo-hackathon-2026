import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    socket.on('notification:new', handleUpdate);
    return () => socket.off('notification:new', handleUpdate);
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="animate-pulse bg-surface h-32 rounded-xl border border-border"></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade_in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifications</h1>
          <p className="text-sm text-ink-muted mt-1">Updates on your assets, bookings, and requests.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-accent hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center text-ink-muted shadow-sm">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div 
              key={n._id} 
              className={`p-4 rounded-xl border transition-colors flex gap-4 ${
                n.isRead ? 'bg-surface border-border opacity-70' : 'bg-surface border-accent shadow-sm'
              }`}
            >
              <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-accent pulse-dot'}`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${n.isRead ? 'text-ink-muted' : 'text-ink font-medium'}`}>
                    {n.message}
                  </p>
                  <span className="text-xs text-ink-muted whitespace-nowrap ml-4">
                    {dayjs(n.createdAt).fromNow()}
                  </span>
                </div>
                <div className="mt-2 flex gap-4 items-center">
                  <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">{n.type.replace(/_/g, ' ')}</span>
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n._id)} className="text-xs font-medium text-accent hover:underline">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
