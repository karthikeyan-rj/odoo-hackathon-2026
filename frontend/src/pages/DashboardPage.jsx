import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import AssetUtilizationChart from '../components/dashboard/AssetUtilizationChart';
import MaintenanceBottlenecksChart from '../components/dashboard/MaintenanceBottlenecksChart';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';

function KPICard({ title, value, isLoading, type = 'default' }) {
  const typeStyles = {
    default: 'border-border/80 text-ink bg-surface/90',
    alert: 'border-rose-500/20 text-rose-700 bg-rose-500/10 shadow-[inset_0_0_8px_rgba(244,63,94,0.1)]',
    warning: 'border-amber-500/20 text-amber-700 bg-amber-500/10 shadow-[inset_0_0_8px_rgba(245,158,11,0.1)]',
  };
  const currentStyle = typeStyles[type];

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-sm transition-all hover:shadow-card ${currentStyle}`}>
      <h3 className="text-sm font-medium text-ink-muted mb-2">{title}</h3>
      <div className="text-3xl font-mono font-medium tracking-tight">
        {isLoading ? (
          <div className="h-9 w-16 bg-ink-muted/20 animate-pulse rounded"></div>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/kpis')
      .then(res => setKpis(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade_in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Operational Overview</h1>
          <p className="text-sm text-ink-muted mt-1">Live system metrics and pending actions.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/assets" className="btn bg-surface border border-border text-ink hover:bg-bg px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Register Asset
          </Link>
          <Link to="/bookings" className="btn bg-surface border border-border text-ink hover:bg-bg px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Book Resource
          </Link>
          <Link to="/maintenance" className="btn bg-accent text-white hover:bg-accent-hover px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Raise Maintenance
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Assets Available" value={kpis?.assetsAvailable ?? 0} isLoading={loading} />
        <KPICard title="Assets Allocated" value={kpis?.assetsAllocated ?? 0} isLoading={loading} />
        <KPICard title="Active Bookings" value={kpis?.activeBookings ?? 0} isLoading={loading} />
        <KPICard title="Pending Transfers" value={kpis?.pendingTransfers ?? 0} isLoading={loading} type={kpis?.pendingTransfers > 0 ? 'warning' : 'default'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KPICard title="Upcoming Returns" value={kpis?.upcomingReturns ?? 0} isLoading={loading} />
        <KPICard title="Maintenance Today" value={kpis?.maintenanceToday ?? 0} isLoading={loading} type={kpis?.maintenanceToday > 0 ? 'warning' : 'default'} />
        <KPICard title="Overdue Returns" value={kpis?.overdueReturns ?? 0} isLoading={loading} type={kpis?.overdueReturns > 0 ? 'alert' : 'default'} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-ink mb-4">Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AssetUtilizationChart />
          <MaintenanceBottlenecksChart />
        </div>
      </div>

      <div>
        <RecentActivityFeed />
      </div>
    </div>
  );
}
