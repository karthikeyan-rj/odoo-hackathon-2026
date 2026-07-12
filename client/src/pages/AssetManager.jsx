import React from "react";
import { KPI, Table } from "./Shared";

function AssetManager() {
  const assetList = [
    ["Dell Latitude 5540", "AF-0001", "New", "Allocated"],
    ["Epson EB-X51", "AF-0002", "Good", "Available"],
    ["HP LaserJet 408", "AF-0019", "Fair", "Available"],
    ["Logitech MX Keys", "AF-0042", "Good", "Allocated"]
  ];

  const pendingTransfers = [
    ["Dell Latitude 5540", "Arun K.", "Riya M.", "Requested"],
    ["Epson EB-X51", "IT Dept", "HR Dept", "Requested"],
    ["HP LaserJet 408", "Priya D.", "Engineering", "Requested"]
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Asset Manager Dashboard</h1>
        <p className="text-xs text-zinc-400">Manage assets, allocations, transfers and categories.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Total Assets" value="138" />
        <KPI label="Available" value="54" />
        <KPI label="Allocated" value="71" />
        <KPI label="Pending Transfers" value="4" sub="Awaiting approval" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Recent Assets</h2>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700">
              + Add Asset
            </button>
          </div>
          <Table cols={["Name", "Tag", "Condition", "Status"]} rows={assetList} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Pending Transfers</h2>
          <Table cols={["Asset", "From", "To", "Status"]} rows={pendingTransfers} />
        </div>
      </div>
    </div>
  );
}

export default AssetManager;
