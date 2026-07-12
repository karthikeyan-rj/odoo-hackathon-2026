import React, { useEffect, useState } from "react";
import { getActivityLogs } from "./api";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getActivityLogs()
      .then((res) => setLogs(res.data || []))
      .catch(() => setError("Failed to load activity history."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-zinc-500 p-4">Loading activity history...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-zinc-900">Activity Logs</h2>
        <p className="text-xs text-zinc-500 mt-0.5">A full history of admin, manager, and employee actions.</p>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs">{error}</div>
      )}

      <div className="bg-white border border-zinc-200 rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
            <tr>
              <th className="px-4 py-2.5 text-left">Action</th>
              <th className="px-4 py-2.5 text-left">Actor</th>
              <th className="px-4 py-2.5 text-left">Entity</th>
              <th className="px-4 py-2.5 text-left">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-zinc-400">No activity history yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{log.action}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{log.actor?.name || "System"}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{log.entityType || "—"}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
