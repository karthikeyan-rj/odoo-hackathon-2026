import React, { useState, useEffect } from "react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "./api";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getNotifications()
      .then(r => setItems(r.data || []))
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setItems(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { /* silent fail */ }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { setError("Failed to mark all as read."); }
  };

  const unreadCount = items.filter(n => !n.isRead).length;

  if (loading) return <div className="text-xs text-zinc-500">Loading notifications...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Notifications</h2>
          {unreadCount > 0 && <p className="text-xs text-zinc-500 mt-0.5">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleReadAll} className="px-3 py-1.5 border border-zinc-200 rounded text-xs text-zinc-600 hover:bg-zinc-100">
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex justify-between">
          {error}<button onClick={() => setError("")} className="font-bold">×</button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-6 bg-white border border-zinc-200 rounded text-center text-xs text-zinc-400">
          You are all caught up.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded divide-y divide-zinc-100">
          {items.map(n => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleRead(n._id)}
              className={`flex items-start gap-3 px-4 py-3 ${!n.isRead ? "cursor-pointer hover:bg-zinc-50" : ""}`}
            >
              <div className="mt-1 shrink-0">
                {n.isRead
                  ? <div className="w-2 h-2 rounded-full border border-zinc-300" />
                  : <div className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-4">
                  <span className={`font-semibold text-zinc-900 text-xs ${!n.isRead ? "" : "text-zinc-500"}`}>
                    {n.type}
                  </span>
                  <span className="text-[10px] text-zinc-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
