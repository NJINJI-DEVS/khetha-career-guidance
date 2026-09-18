// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { KHETHA } from '../../theme/tokens';

export function Progress({ value, max, color = KHETHA.green }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.round((value / max) * 100)}%`, background: color }}
      />
    </div>
  );
}
