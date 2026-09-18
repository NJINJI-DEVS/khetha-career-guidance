// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { Check } from 'lucide-react';

export function JourneyStep({ n, title, body, done, cta, onCta, color }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold"
          style={{ background: done ? color : "#E2E8F0", color: done ? "#FFFFFF" : "#475569" }}>
          {done ? <Check className="h-4 w-4" /> : n}
        </span>
        {n < 4 && <span className="my-1 w-px flex-1 bg-slate-200" />}
      </div>
      <div className="flex-1 pb-5">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{body}</p>
        {!done && cta && (
          <button onClick={onCta}
            className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white">
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}
