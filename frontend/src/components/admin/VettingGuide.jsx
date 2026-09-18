// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { Info, ChevronRight } from 'lucide-react';
import { VETTING_GUIDE } from '../../data/seedApplications';

/* ---- Reviewer guidance -------------------------------------------- */
export function VettingGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border k-bd-D4AF37 k-bg-FBF5E7 p-4">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="flex w-full items-start gap-3 text-left">
        <Info className="mt-0.5 h-5 w-5 shrink-0 k-tx-6B5307" />
        <span className="flex-1">
          <span className="block text-sm font-semibold k-tx-6B5307">What to watch out for</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed k-tx-6B5307">
            Eight patterns that recur when someone is not who they say they are. These accounts contact minors, so
            the bar is corroboration, not plausibility.
          </span>
        </span>
        <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 k-tx-6B5307 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-2.5 border-t k-bd-E4CE8A pt-3">
          {VETTING_GUIDE.map((g) => (
            <div key={g.title}>
              <p className="text-[11px] font-semibold k-tx-6B5307">{g.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700">{g.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
