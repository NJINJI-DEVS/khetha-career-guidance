// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { CheckCircle2, ChevronRight, X } from 'lucide-react';

/* Sticky prompt so a learner never has to go back to the dashboard */
export function NextStepBar({ t, journey, go, onDismiss }) {
  if (!journey.next) {
    return (
      <div className="flex items-center gap-3 border-t k-bd-00784A k-bg-E7F4EE px-4 py-2.5">
        <CheckCircle2 className="h-5 w-5 shrink-0 k-tx-005A36" />
        <p className="flex-1 text-[11px] font-semibold leading-tight k-tx-005A36">
          {t("allStepsDone")}
        </p>
        <button onClick={() => go("sms")}
          className="shrink-0 rounded-lg k-bg-005A36 px-3 py-1.5 text-[11px] font-semibold text-white">
          SMS it
        </button>
      </div>
    );
  }
  const Icon = journey.next.icon;
  return (
    <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
        style={{ background: journey.next.color }}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] leading-tight text-slate-600">
          {t("stepOf", { n: journey.next.n, total: journey.total })}
        </p>
        <p className="truncate text-[12px] font-semibold leading-tight text-slate-900">{t(journey.next.labelKey)}</p>
      </div>
      <button onClick={() => go(journey.next.route)}
        className="flex shrink-0 items-center gap-1 rounded-lg k-bg-005A36 px-3 py-1.5 text-[11px] font-semibold text-white">
        {t("continueBtn")}<ChevronRight className="h-3.5 w-3.5" />
      </button>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Hide the next step prompt"
          className="shrink-0 text-slate-500"><X className="h-4 w-4" /></button>
      )}
    </div>
  );
}
