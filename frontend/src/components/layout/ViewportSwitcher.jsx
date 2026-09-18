// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { VIEWPORTS } from '../../data/viewports';

export function ViewportSwitcher({ value, onChange }) {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/95 p-1 shadow-xl">
      <div className="flex items-center gap-0.5">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">View</span>
        {VIEWPORTS.map((v) => {
          const Icon = v.icon;
          const on = value === v.key;
          return (
            <button key={v.key} onClick={() => onChange(v.key)} title={v.label}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                on ? "k-bg-D4AF37 text-slate-900" : "text-slate-300"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
