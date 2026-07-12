import React from "react";
import { Link } from "react-router-dom";
import { KPI, Table } from "./Shared";

function Employee() {
  const myAssets = [
    ["Dell Latitude 5540", "AF-0001", "Sep 1 2026", "Active"],
    ["Logitech MX Keys", "AF-0042", "Jul 1 2026", "Overdue"]
  ];

  const quickActions = [
    { label: "Book a Resource", path: "/book-resource", desc: "Reserve equipment or workspace" },
    { label: "Raise Maintenance Request", path: "/maintenance", desc: "Report a fault or request service" },
    { label: "View My Assets", path: "/my-assets", desc: "Allocations assigned to you" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Employee Dashboard</h1>
        <p className="text-xs text-zinc-400">Your assets, bookings, and maintenance requests.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Active Allocations" value="2" />
        <KPI label="Upcoming Bookings" value="1" />
        <KPI label="Pending Maintenance" value="1" />
        <KPI label="Overdue Returns" value="1" sub="Action required" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">My Assets</h2>
            <Link to="/my-assets" className="text-[10px] text-blue-600 hover:underline">View all →</Link>
          </div>
          <Table cols={["Asset", "Tag", "Due Date", "Status"]} rows={myAssets} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Quick Actions</h2>
          <div className="bg-white border border-zinc-200 rounded divide-y divide-zinc-100">
            {quickActions.map(function(action) {
              return (
                <Link key={action.path} to={action.path} className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50">
                  <div>
                    <div className="font-medium text-zinc-800">{action.label}</div>
                    <div className="text-[10px] text-zinc-400">{action.desc}</div>
                  </div>
                  <span className="text-zinc-400">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Employee;
