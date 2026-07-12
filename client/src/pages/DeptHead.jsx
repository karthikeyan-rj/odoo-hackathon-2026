import React, { useEffect, useState } from "react";
import { KPI, Table } from "./Shared";
import api from "../api";

function DeptHead() {
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/allocations/department"),
      api.get("/api/transfers/department")
    ])
      .then(([allocRes, transferRes]) => {
        setAllocations(allocRes.data || []);
        setTransfers(transferRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const teamAllocations = allocations.slice(0, 5).map((item) => [item.assigneeUser?.name || "Dept", item.asset?.name || "—", item.expectedReturnDate ? new Date(item.expectedReturnDate).toLocaleDateString() : "—", item.status]);
  const pendingApprovals = transfers.slice(0, 5).map((item) => [item.requestedBy?.name || "—", item.reason || "Transfer", item.asset?.name || "—", item.status]);
  const overdueReturns = allocations.filter((item) => item.expectedReturnDate && new Date(item.expectedReturnDate) < new Date()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Department Head Dashboard</h1>
        <p className="text-xs text-zinc-400">Engineering dept — team assets, pending requests.</p>
      </div>

      {loading ? (
        <div className="text-xs text-zinc-500">Loading department dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <KPI label="Team Members" value={allocations.length.toString()} />
            <KPI label="Dept Assets" value={allocations.length.toString()} />
            <KPI label="Pending Requests" value={transfers.length.toString()} sub="Awaiting your approval" />
            <KPI label="Overdue Returns" value={overdueReturns.toString()} sub="Follow up required" />
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
        </>
      )}
    </div>
  );
}

export default DeptHead;
