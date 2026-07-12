import React from "react";
import { KPI, Table } from "./Shared";

function DeptHead() {
  const teamAllocations = [
    ["Arun Kumar", "Dell Latitude 5540", "Sep 1 2026", "Active"],
    ["Riya M.", "Logitech MX Keys", "Dec 31 2026", "Active"],
    ["Suresh P.", "HP Monitor 24", "Jul 1 2026", "Overdue"],
    ["Divya N.", "iPhone 13", "Oct 1 2026", "Active"]
  ];

  const pendingApprovals = [
    ["Arun Kumar", "Maintenance", "Dell Latitude", "Approve / Reject"],
    ["Riya M.", "Transfer", "MX Keys", "Approve / Reject"],
    ["Suresh P.", "Return", "HP Monitor", "Approve / Reject"]
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Department Head Dashboard</h1>
        <p className="text-xs text-zinc-400">Engineering dept — team assets, pending requests.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Team Members" value="12" />
        <KPI label="Dept Assets" value="34" />
        <KPI label="Pending Requests" value="3" sub="Awaiting your approval" />
        <KPI label="Overdue Returns" value="2" sub="Follow up required" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Team Asset Allocations</h2>
          <Table cols={["Employee", "Asset", "Due Date", "Status"]} rows={teamAllocations} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Pending Approvals</h2>
          <Table cols={["Employee", "Type", "Asset", "Action"]} rows={pendingApprovals} />
        </div>
      </div>
    </div>
  );
}

export default DeptHead;
