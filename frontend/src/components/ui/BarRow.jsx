// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { THEME } from '../../theme/tokens';

export function BarRow({ label, value, max, display, color = THEME.primary }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[11px] text-slate-700">{label}</span>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-900">{display}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}
