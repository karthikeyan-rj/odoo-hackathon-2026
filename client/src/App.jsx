import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Layout from "./Layout";

// Role dashboards
import Dashboard from "./Dashboard";
import Admin from "./pages/Admin";
import AssetManager from "./pages/AssetManager";
import DeptHead from "./pages/DeptHead";

// Employee screens
import MyAssets from "./MyAssets";
import BookResource from "./BookResource";
import Maintenance from "./Maintenance";

// AssetManager / Admin screens
import AssetDirectory from "./AssetDirectory";
import AllocationManager from "./AllocationManager";
import MaintenanceApprovals from "./MaintenanceApprovals";

// Admin only
import OrgSetup from "./OrgSetup";

// Department Head
import DepartmentView from "./DepartmentView";

// Shared
import Notifications from "./Notifications";

// Route guard — same mechanism as before
function Guard(props) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return props.children;
}

// Picks the correct dashboard for the logged-in role
function RoleDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role === "Admin") return <Admin />;
  if (user.role === "AssetManager") return <AssetManager />;
  if (user.role === "DepartmentHead") return <DeptHead />;
  return <Dashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<RoleDashboard />} />

          {/* Employee */}
          <Route path="my-assets"     element={<MyAssets />} />
          <Route path="book-resource" element={<BookResource />} />
          <Route path="maintenance"   element={<Maintenance />} />

          {/* AssetManager + Admin */}
          <Route path="assets"                element={<AssetDirectory />} />
          <Route path="allocations"           element={<AllocationManager />} />
          <Route path="maintenance-approvals" element={<MaintenanceApprovals />} />

          {/* Admin only */}
          <Route path="org-setup" element={<OrgSetup />} />

          {/* Department Head */}
          <Route path="department-view" element={<DepartmentView />} />

          {/* Shared */}
          <Route path="notifications" element={<Notifications />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
