// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { Loader2, CheckCircle2, FileDown } from 'lucide-react';

/* ---- Simulated file drop ------------------------------------------ */
export function FileDrop({ label, hint, value, onChange, accept = "PDF or photo" }) {
  const [busy, setBusy] = useState(false);
  const pick = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onChange(`${label.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    }, 900);
  };
  return (
    <div>
      <p className="text-xs font-medium text-slate-700">{label}</p>
      <button onClick={pick} disabled={busy}
        className={`mt-1.5 flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left ${
          value ? "k-bd-00784A k-bg-E7F4EE" : "border-slate-300 bg-white"
        }`}>
        {busy ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-slate-500" />
          : value ? <CheckCircle2 className="h-5 w-5 shrink-0 k-tx-005A36" />
          : <FileDown className="h-5 w-5 shrink-0 text-slate-500" />}
        <span className="flex-1">
          <span className={`block text-xs font-semibold ${value ? "k-tx-005A36" : "text-slate-900"}`}>
            {busy ? "Uploading…" : value || "Tap to upload"}
          </span>
          <span className="block text-[10px] text-slate-600">{value ? "Received — pending review" : `${accept}. ${hint}`}</span>
        </span>
      </button>
    </div>
  );
}
