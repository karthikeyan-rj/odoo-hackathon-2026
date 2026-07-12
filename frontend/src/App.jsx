import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppShell from './components/layout/AppShell';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// App pages
import DashboardPage from './pages/DashboardPage';
import AssetListPage from './pages/assets/AssetListPage';
import AssetDetailPage from './pages/assets/AssetDetailPage';
import AllocationPage from './pages/allocations/AllocationPage';
import BookingPage from './pages/bookings/BookingPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import OrgSetupPage from './pages/org/OrgSetupPage';
import NotificationsPage from './pages/NotificationsPage';
import AuditPage from './pages/audits/AuditPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return (
    <div className="flex items-center justify-center h-full text-ink-muted text-sm">
      Access denied. This page requires Administrator role.
    </div>
  );
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* Protected routes inside the shell */}
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="assets" element={<AssetListPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="allocations" element={<AllocationPage />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="audits" element={<AdminRoute><AuditPage /></AdminRoute>} />
        <Route path="org" element={<AdminRoute><OrgSetupPage /></AdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
