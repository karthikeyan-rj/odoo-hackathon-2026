function ChartSkeleton({ variant }) {
  if (variant === 'donut') {
    return (
      <div className="flex flex-col items-center justify-center h-[240px] gap-4 animate-pulse">
        <div className="w-36 h-36 rounded-full border-[14px] border-border/60" />
        <div className="flex gap-3">
          <div className="h-3 w-16 bg-border/50 rounded" />
          <div className="h-3 w-16 bg-border/50 rounded" />
          <div className="h-3 w-16 bg-border/50 rounded" />
        </div>
      </div>
    );
  }
  if (variant === 'bars') {
    return (
      <div className="h-[240px] flex flex-col justify-center gap-4 animate-pulse">
        {[85, 60, 95, 40, 70].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-20 bg-border/50 rounded shrink-0" />
            <div className="h-4 bg-border/50 rounded" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    );
  }
  // feed
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-1.5 w-2 h-2 rounded-full bg-border/60 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-border/50 rounded w-2/3" />
          </div>
          <div className="h-3 w-10 bg-border/50 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message, icon }) {
  return (
    <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-ink-muted">
      <div className="w-10 h-10 rounded-full bg-bg border border-border/70 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function ChartCard({ title, subtitle, isLoading, isEmpty, emptyMessage, emptyIcon, skeletonVariant, children }) {
  return (
    <div className="bg-surface/90 backdrop-blur-md border border-border/80 rounded-2xl shadow-sm p-6 transition-all hover:shadow-card">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-xs text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {isLoading ? (
        <ChartSkeleton variant={skeletonVariant} />
      ) : isEmpty ? (
        <EmptyState message={emptyMessage} icon={emptyIcon} />
      ) : (
        children
      )}
    </div>
  );
}
