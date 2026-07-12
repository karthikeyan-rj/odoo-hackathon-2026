import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KPI, Table } from "./Shared";
import { getAssets, getTransferRequests } from "../api";

function AssetManager() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, available: 0, allocated: 0, pendingTransfers: 0 });
  const [recentAssets, setRecentAssets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAssets().then(r => r.data || []),
      getTransferRequests("Requested").then(r => r.data || [])
    ]).then(([assets, rawTransfers]) => {
      setStats({
        total: assets.length,
        available: assets.filter(a => a.status === "Available").length,
        allocated: assets.filter(a => a.status === "Allocated").length,
        pendingTransfers: rawTransfers.length
      });

      // Map recent assets (last 4)
      const mappedAssets = assets.slice(-4).map(a => [
        a.name,
        a.assetTag,
        a.condition,
        a.status
      ]);
      setRecentAssets(mappedAssets);

      // Map pending transfers (last 4)
      const mappedTransfers = rawTransfers.slice(0, 4).map(t => [
        t.asset?.name || "Unknown Asset",
        t.requestedBy?.name || "—",
        t.targetUser?.name || t.targetDepartment?.name || "—",
        t.status
      ]);
      setTransfers(mappedTransfers);
    }).catch(err => {
      console.error("Failed to load Asset Manager dashboard stats:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-xs text-zinc-400 p-4">Loading Asset Manager Stats...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Asset Manager Dashboard</h1>
        <p className="text-xs text-zinc-400">Manage assets, allocations, transfers and categories.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Total Assets" value={stats.total.toString()} />
        <KPI label="Available" value={stats.available.toString()} />
        <KPI label="Allocated" value={stats.allocated.toString()} />
        <KPI label="Pending Transfers" value={stats.pendingTransfers.toString()} sub="Awaiting approval" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Recent Assets</h2>
            <button 
              onClick={() => navigate("/assets", { state: { openForm: true } })} 
              className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700 transition"
            >
              + Add Asset
            </button>
          </div>
          <Table cols={["Name", "Tag", "Condition", "Status"]} rows={recentAssets} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Pending Transfers</h2>
          <Table cols={["Asset", "From", "To", "Status"]} rows={transfers} />
        </div>
      </div>
    </div>
  );
}

export default AssetManager;
