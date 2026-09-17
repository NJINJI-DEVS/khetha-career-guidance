// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { THEME } from '../../theme/tokens';

export function StatCard({ label, value, sub, color = THEME.primary, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-tight text-slate-600">{label}</p>
        {Icon && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: color }}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] leading-tight text-slate-600">{sub}</p>}
    </div>
  );
}
