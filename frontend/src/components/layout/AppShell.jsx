import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../lib/api';

const ICONS = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  assets: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  allocations: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  bookings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  maintenance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  audits: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  org: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
};

function NavItem({ to, label, icon, exact = false }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 mt-1 rounded-lg transition-colors font-medium text-sm
        ${isActive ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:bg-surface hover:text-ink'}`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function BottomNavItem({ to, label, icon, exact = false }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
        ${isActive ? 'text-accent' : 'text-ink-muted hover:text-ink'}`
      }
    >
      {icon}
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navLinks = [
    { to: '/', label: 'Dashboard', exact: true, icon: ICONS.dashboard },
    { to: '/assets', label: 'Assets', icon: ICONS.assets },
    { to: '/allocations', label: 'Allocations', icon: ICONS.allocations },
    { to: '/bookings', label: 'Bookings', icon: ICONS.bookings },
    { to: '/maintenance', label: 'Maintenance', icon: ICONS.maintenance },
  ];

  // Fetch initial unread count
  useEffect(() => {
    api.get('/notifications?unreadOnly=true')
      .then(res => setUnreadCount(res.data.data.length))
      .catch(() => {});
  }, []);

  // Listen for socket events for toast + bell badge
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (data) => {
      setUnreadCount(c => c + 1);
      addToast(data.notification.message, 'info');
    };
    socket.on('notification:new', handleNewNotification);
    return () => socket.off('notification:new', handleNewNotification);
  }, [socket, addToast]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden relative">
      {/* Backdrop overlay for when sidebar is open on smaller screens */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-ink">AssetFlow</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-1 text-ink-muted hover:text-ink hover:bg-bg rounded-lg transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navLinks.map(link => <NavItem key={link.to} {...link} />)}
          {user?.role === 'Admin' && (
            <>
              <div className="mt-8 mb-2 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Admin
              </div>
              <NavItem to="/audits" label="Audits" icon={ICONS.audits} />
              <NavItem to="/org" label="Org Setup" icon={ICONS.org} />
            </>
          )}
        </nav>
        <div className="p-4 border-t border-border mb-16 lg:mb-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink-muted truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 text-sm font-medium text-ink-muted hover:text-ink hover:bg-bg rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 -ml-2 text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-bg focus:outline-none"
          >
            {isSidebarOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <NavLink to="/notifications" className="relative p-2 text-ink-muted hover:text-ink transition-colors">
            {/* Simple Bell Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface animate-pulse" />
            )}
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around z-40 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] overflow-x-auto">
        {navLinks.map(link => <BottomNavItem key={link.to} {...link} />)}
        {user?.role === 'Admin' && (
          <>
            <BottomNavItem to="/audits" label="Audits" icon={ICONS.audits} />
            <BottomNavItem to="/org" label="Org" icon={ICONS.org} />
          </>
        )}
      </nav>
    </div>
  );
}
