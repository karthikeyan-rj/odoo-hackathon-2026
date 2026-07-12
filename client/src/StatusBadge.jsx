import React from "react";

const colorMap = {
  // green
  Available: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Returned: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",

  // blue
  Allocated: "bg-blue-100 text-blue-800 border-blue-200",
  Active: "bg-blue-100 text-blue-800 border-blue-200",
  Upcoming: "bg-blue-100 text-blue-800 border-blue-200",
  TechnicianAssigned: "bg-blue-100 text-blue-800 border-blue-200",

  // violet
  Reserved: "bg-violet-100 text-violet-800 border-violet-200",
  Transferred: "bg-violet-100 text-violet-800 border-violet-200",
  InProgress: "bg-violet-100 text-violet-800 border-violet-200",

  // amber
  UnderMaintenance: "bg-amber-100 text-amber-800 border-amber-200",
  Ongoing: "bg-amber-100 text-amber-800 border-amber-200",
  High: "bg-amber-100 text-amber-800 border-amber-200",

  // red
  Lost: "bg-red-100 text-red-800 border-red-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Damaged: "bg-red-100 text-red-800 border-red-200",
  Critical: "bg-red-100 text-red-800 border-red-200",

  // gray
  Retired: "bg-zinc-100 text-zinc-800 border-zinc-200",
  Disposed: "bg-zinc-100 text-zinc-800 border-zinc-200",
  Cancelled: "bg-zinc-100 text-zinc-800 border-zinc-200",
  Pending: "bg-zinc-100 text-zinc-800 border-zinc-200",
  Missing: "bg-zinc-100 text-zinc-800 border-zinc-200",
  Low: "bg-zinc-100 text-zinc-800 border-zinc-200",
};

export default function StatusBadge(props) {
  const { value } = props;
  
  if (!value) {
    return null;
  }

  const badgeClass = colorMap[value] || "bg-zinc-100 text-zinc-800 border-zinc-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}>
      {value}
    </span>
  );
}
