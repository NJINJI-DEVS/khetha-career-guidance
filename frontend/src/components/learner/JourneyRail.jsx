// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { Check } from 'lucide-react';

/* Numbered rail shown at the top of the dashboard */
export function JourneyRail({ t, journey, go }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {journey.steps.map((s) => {
        const Icon = s.icon;
        const isNext = journey.next?.key === s.key;
        return (
          <button key={s.key} onClick={() => go(s.route)}
            className={`flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors ${
              isNext ? "border-slate-900 bg-white ring-1 ring-slate-900" : "border-slate-200 bg-white"
            }`}>
            <span className="grid h-8 w-8 place-items-center rounded-full"
              style={{ background: s.complete ? s.color : "#E2E8F0", color: s.complete ? "#fff" : "#475569" }}>
              {s.complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className="text-[10px] font-semibold leading-tight text-slate-900">{t(s.shortKey)}</span>
            {isNext && <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">{t("next")}</span>}
          </button>
        );
      })}
    </div>
  );
}
