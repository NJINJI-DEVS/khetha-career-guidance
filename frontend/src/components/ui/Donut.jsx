// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
export function Donut({ segments, centreLabel, centreValue }) {
  const total = segments.reduce((a, s) => a + s.n, 0);
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" role="img" aria-label={`${centreLabel}: ${centreValue}`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#E2E8F0" strokeWidth="18" />
        {segments.map((s) => {
          const len = (s.n / total) * C;
          const el = (
            <circle key={s.method || s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="18"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
              transform="rotate(-90 70 70)" />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 20, fontWeight: 700 }}>
          {centreValue}
        </text>
        <text x="70" y="82" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 9 }}>
          {centreLabel}
        </text>
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {segments.map((s) => (
          <div key={s.method || s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1 truncate text-[11px] text-slate-700">{s.method || s.label}</span>
            <span className="text-[11px] font-semibold tabular-nums text-slate-900">
              {Math.round((s.n / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
