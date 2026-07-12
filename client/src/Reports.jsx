import React, { useEffect, useMemo, useState } from "react";
import api from "./api";
import StatusBadge from "./StatusBadge";

function groupBy(list, getKey) {
  return list.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export default function Reports() {
  const [assets, setAssets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/assets"),
      api.get("/api/allocations"),
      api.get("/api/maintenance"),
      api.get("/api/bookings"),
      api.get("/api/transfers"),
    ])
      .then(([aRes, allocRes, maintRes, bookRes, transferRes]) => {
        setAssets(aRes.data || []);
        setAllocations(allocRes.data || []);
        setMaintenance(maintRes.data || []);
        setBookings(bookRes.data || []);
        setTransfers(transferRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const activeAllocations = allocations.filter((a) => a.status === "Active");
    const pendingMaintenance = maintenance.filter((m) => m.status === "Pending");
    const upcomingBookings = bookings.filter((b) => b.status === "Upcoming");
    const pendingTransfers = transfers.filter((t) => t.status === "Requested");

    const statusCounts = groupBy(assets, (asset) => asset.status || "Unknown");
    const maintenanceByCategory = groupBy(maintenance, (item) => item.asset?.category?.name || "Uncategorized");
    const allocationByDepartment = groupBy(activeAllocations, (item) => item.assigneeDepartment?.name || item.assigneeUser?.department?.name || "Unassigned");
    const peakHours = groupBy(bookings, (booking) => new Date(booking.startTime).getHours().toString().padStart(2, "0"));

    return {
      totalAssets: assets.length,
      availableAssets: assets.filter((asset) => asset.status === "Available").length,
      activeAllocations: activeAllocations.length,
      pendingMaintenance: pendingMaintenance.length,
      upcomingBookings: upcomingBookings.length,
      pendingTransfers: pendingTransfers.length,
      statusCounts,
      maintenanceByCategory,
      allocationByDepartment,
      peakHours,
    };
  }, [assets, allocations, maintenance, bookings, transfers]);

  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Assets", stats.totalAssets],
      ["Available Assets", stats.availableAssets],
      ["Active Allocations", stats.activeAllocations],
      ["Pending Maintenance", stats.pendingMaintenance],
      ["Upcoming Bookings", stats.upcomingBookings],
      ["Pending Transfers", stats.pendingTransfers],
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "assetflow-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-xs text-zinc-500 p-4">Loading analytics...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Reports & Analytics</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Operational snapshot for assets, maintenance, bookings, and allocations.</p>
        </div>
        <button onClick={exportReport} className="px-3 py-1.5 border border-zinc-200 rounded text-xs text-zinc-600 hover:bg-zinc-100">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
        {["Total Assets", "Available Assets", "Active Allocations", "Pending Maintenance", "Upcoming Bookings", "Pending Transfers"].map((label, index) => {
          const values = [stats.totalAssets, stats.availableAssets, stats.activeAllocations, stats.pendingMaintenance, stats.upcomingBookings, stats.pendingTransfers];
          return (
            <div key={label} className="bg-white border border-zinc-200 rounded p-3">
              <div className="text-xl font-bold text-zinc-900">{values[index]}</div>
              <div className="text-[10px] uppercase text-zinc-400 mt-1">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 mb-3">Asset status mix</h3>
          <div className="space-y-2">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-xs text-zinc-600">
                <span>{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 mb-3">Maintenance by category</h3>
          <div className="space-y-2">
            {Object.entries(stats.maintenanceByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between text-xs text-zinc-600">
                <span>{category}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 mb-3">Department allocation summary</h3>
          <div className="space-y-2">
            {Object.entries(stats.allocationByDepartment).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between text-xs text-zinc-600">
                <span>{dept}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 mb-3">Booking heatmap</h3>
          <div className="space-y-2">
            {Object.entries(stats.peakHours).sort(([a], [b]) => Number(a) - Number(b)).map(([hour, count]) => (
              <div key={hour} className="flex items-center gap-2 text-xs text-zinc-600">
                <span className="w-10">{hour}:00</span>
                <div className="flex-1 h-2 rounded bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded bg-blue-500" style={{ width: `${Math.min(count * 12, 100)}%` }} />
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 mb-3">Current action queue</h3>
        <div className="space-y-2">
          {maintenance.filter((m) => m.status === "Pending").slice(0, 4).map((item) => (
            <div key={item._id} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 last:pb-0 text-xs text-zinc-600">
              <span>{item.asset?.name || "Asset"} — {item.description}</span>
              <StatusBadge value={item.status} />
            </div>
          ))}
          {maintenance.filter((m) => m.status === "Pending").length === 0 && <div className="text-xs text-zinc-400">No pending maintenance at the moment.</div>}
        </div>
      </div>
    </div>
  );
}
