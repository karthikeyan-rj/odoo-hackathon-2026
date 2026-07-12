import React, { useState } from "react";
import DeptTab from "./org/DeptTab";
import CatTab from "./org/CatTab";
import UsersTab from "./org/UsersTab";

const TABS = [
  { key: "departments", label: "Departments" },
  { key: "categories",  label: "Categories" },
  { key: "users",       label: "Employee Directory" }
];

export default function OrgSetup() {
  const [activeTab, setActiveTab] = useState("departments");

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-zinc-900">Org Setup</h2>

      <div className="flex gap-1 border-b border-zinc-200">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={
              activeTab === t.key
                ? "px-4 py-2 text-xs font-semibold border-b-2 border-zinc-900 text-zinc-900 -mb-px"
                : "px-4 py-2 text-xs text-zinc-500 hover:text-zinc-700"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "departments" && <DeptTab />}
        {activeTab === "categories"  && <CatTab />}
        {activeTab === "users"       && <UsersTab />}
      </div>
    </div>
  );
}
