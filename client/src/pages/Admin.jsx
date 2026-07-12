import React, { useState, useEffect } from "react";
import { KPI, Table } from "./Shared";
import { getUsers, getDepartments, getAssets, getActivityLogs } from "../api";

function Admin() {
  const [stats, setStats] = useState({ users: 0, depts: 0, assets: 0, inactive: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUsers().then(r => r.data || []),
      getDepartments().then(r => r.data || []),
      getAssets().then(r => r.data || []),
      getActivityLogs().then(r => r.data || [])
    ]).then(([users, depts, assets, rawLogs]) => {
      setStats({
        users: users.length,
        depts: depts.length,
        assets: assets.length,
        inactive: users.filter(u => u.status === "Inactive").length
      });
      
      // Map recent users (last 4 users)
      const mappedUsers = users.slice(-4).map(u => [
        u.name,
        u.role,
        u.department?.name || "—",
        u.status
      ]);
      setRecentUsers(mappedUsers);

      // Map recent activity logs (last 4 actions)
      const mappedLogs = rawLogs.slice(0, 4).map(l => [
        l.action,
        l.actor?.name || "System",
        new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ]);
      setLogs(mappedLogs);
    }).catch(err => {
      console.error("Failed to load admin dashboard stats:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-xs text-zinc-400 p-4">Loading Admin Stats...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Admin Dashboard</h1>
        <p className="text-xs text-zinc-400">System-wide overview — users, departments, live audit logs.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Total Users" value={stats.users.toString()} />
        <KPI label="Departments" value={stats.depts.toString()} />
        <KPI label="Total Assets" value={stats.assets.toString()} />
        <KPI label="Inactive Users" value={stats.inactive.toString()} sub="Needs review" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Recent Users</h2>
          <Table cols={["Name", "Role", "Department", "Status"]} rows={recentUsers} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Activity Logs</h2>
          <Table cols={["Action", "User", "Time"]} rows={logs} />
        </div>
      </div>
    </div>
  );
}

export default Admin;
