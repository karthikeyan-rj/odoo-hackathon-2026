import React from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  let navLinks = [];

  if (user.role === "Admin") {
    navLinks = [
      { label: "Dashboard",            path: "/dashboard" },
      { label: "Asset Directory",       path: "/assets" },
      { label: "Allocation Manager",    path: "/allocations" },
      { label: "Maintenance Approvals", path: "/maintenance-approvals" },
      { label: "Org Setup",             path: "/org-setup" },
      { label: "Notifications",         path: "/notifications" }
    ];
  } else if (user.role === "AssetManager") {
    navLinks = [
      { label: "Dashboard",            path: "/dashboard" },
      { label: "Asset Directory",       path: "/assets" },
      { label: "Allocation Manager",    path: "/allocations" },
      { label: "Maintenance Approvals", path: "/maintenance-approvals" },
      { label: "Notifications",         path: "/notifications" }
    ];
  } else if (user.role === "DepartmentHead") {
    navLinks = [
      { label: "Dashboard",        path: "/dashboard" },
      { label: "Department View",  path: "/department-view" },
      { label: "Book Resource",    path: "/book-resource" },
      { label: "Notifications",    path: "/notifications" }
    ];
  } else {
    // Employee
    navLinks = [
      { label: "Dashboard",     path: "/dashboard" },
      { label: "My Assets",     path: "/my-assets" },
      { label: "Book Resource", path: "/book-resource" },
      { label: "Maintenance",   path: "/maintenance" },
      { label: "Notifications", path: "/notifications" }
    ];
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-zinc-50 text-xs text-zinc-800">
      <aside className="w-52 bg-white border-r border-zinc-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-200">
          <div className="font-bold text-zinc-900 text-sm">AssetFlow</div>
          <div className="mt-1 text-[10px] text-zinc-400 uppercase tracking-wide font-medium">
            {user.role}
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navLinks.map(function (link) {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={
                  isActive
                    ? "flex items-center px-3 py-2 rounded bg-zinc-900 text-white font-semibold"
                    : "flex items-center px-3 py-2 rounded text-zinc-600 hover:bg-zinc-100 transition"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-200">
          <div className="px-3 py-2 mb-2 bg-zinc-50 border border-zinc-200 rounded">
            <div className="font-semibold text-zinc-900 truncate">{user.name}</div>
            <div className="text-[10px] text-zinc-400 truncate">{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="w-full py-1.5 border border-zinc-200 hover:bg-zinc-100 rounded text-zinc-600 font-medium transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
