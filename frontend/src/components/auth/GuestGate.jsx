// Guest mode surfaces.
//
// The point of guest mode is that a learner can see the whole app before
// deciding to trust it with anything — so the banner never blocks, and the
// gate only appears on the handful of features that genuinely cannot work
// without an account (reaching a real human, and anything that must persist).
import { UserPlus, Eye, Lock } from 'lucide-react';

export function GuestBanner({ onCreateAccount }) {
  return (
    <div className="flex items-center gap-3 border-b k-bd-E4CE8A k-bg-FBF5E7 px-4 py-2.5">
      <Eye className="h-4 w-4 shrink-0 k-tx-6B5307" />
      <p className="flex-1 text-[11px] leading-relaxed k-tx-6B5307">
        <span className="font-semibold">Looking around as a guest.</span> Nothing you do here leaves this device.
      </p>
      <button onClick={onCreateAccount}
        className="shrink-0 rounded-lg k-bg-005A36 px-2.5 py-1.5 text-[11px] font-semibold text-white">
        Create account
      </button>
    </div>
  );
}

export function GuestGate({ title, body, onCreateAccount }) {
  return (
    <div className="p-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl k-bg-E7F4EE k-tx-005A36">
          <Lock className="h-6 w-6" />
        </span>
        <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-slate-600">{body}</p>
        <button onClick={onCreateAccount}
          className="mt-4 inline-flex items-center gap-2 rounded-xl k-bg-005A36 px-4 py-2.5 text-sm font-semibold text-white">
          <UserPlus className="h-4 w-4" />Create a free account
        </button>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
          Everything else stays open without one — the directories, the APS calculator and all three questionnaires.
        </p>
      </div>
    </div>
  );
}
