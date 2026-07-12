export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface/95 backdrop-blur-xl border border-border/80 rounded-lg shadow-modal px-3 py-2 text-xs min-w-[120px]">
      {label && <div className="font-semibold text-ink mb-1.5">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-ink-muted">{p.name}</span>
          <span className="font-mono font-semibold text-ink ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
