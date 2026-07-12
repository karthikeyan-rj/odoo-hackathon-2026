import React from "react";
import { KPI, Table } from "./Shared";

function Admin() {
  const userList = [
    ["Arun Kumar", "Employee", "Engineering", "Active"],
    ["Meena R.", "DepartmentHead", "HR", "Active"],
    ["Vikram S.", "AssetManager", "IT", "Active"],
    ["Priya D.", "Employee", "Finance", "Inactive"]
  ];

  const auditLogs = [
    ["Asset allocated", "Vikram S.", "Today 9:42 AM"],
    ["User role changed", "Admin", "Today 9:10 AM"],
    ["Transfer approved", "Meena R.", "Yesterday"],
    ["New asset added", "Vikram S.", "Yesterday"]
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Admin Dashboard</h1>
        <p className="text-xs text-zinc-400">System-wide overview — users, departments, audit.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Total Users" value="24" />
        <KPI label="Departments" value="6" />
        <KPI label="Total Assets" value="138" />
        <KPI label="Inactive Users" value="3" sub="Needs review" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Recent Users</h2>
          <Table cols={["Name", "Role", "Department", "Status"]} rows={userList} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Audit Log</h2>
          <Table cols={["Action", "User", "Time"]} rows={auditLogs} />
        </div>
      </div>
    </div>
  );
}

export default Admin;
