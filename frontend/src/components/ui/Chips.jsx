// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { KHETHA } from '../../theme/tokens';
import { HorizontalScroller } from './HorizontalScroller';

export function Chips({ options, value, onChange, colorFor }) {
  return (
    <HorizontalScroller className="-mx-4 flex gap-2 px-4 pb-1">
      {options.map((o) => {
        const on = value === o.key;
        const c = colorFor?.(o.key);
        return (
          <button key={o.key} onClick={() => onChange(o.key)}
            style={on && c ? { background: c, color: c === KHETHA.gold ? KHETHA.ink : "#fff" } : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              on ? (c ? "" : "k-bg-005A36 text-white") : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}>
            {o.label}
          </button>
        );
      })}
    </HorizontalScroller>
  );
}
