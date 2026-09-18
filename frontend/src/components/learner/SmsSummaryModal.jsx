// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { buildSmsSummary } from '../../engines/smsSummary';
import { ModalShell } from '../ui/ModalShell';
import { SaStripe } from '../ui/BrandMarks';

export function SmsSummaryModal({ learner, aps, matched, packages, profile, onClose }) {
  const [sent, setSent] = useState(false);
  const [number, setNumber] = useState("");
  const [copied, setCopied] = useState(false);

  const body = useMemo(
    () => buildSmsSummary({ learner, aps, matched, packages, profile }),
    [learner, aps, matched, packages, profile]
  );
  const segments = Math.ceil(body.length / 160);

  const copy = () => {
    try {
      navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };

  return (
    <ModalShell title="SMS summary" onClose={onClose} wide>
      {sent ? (
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 k-tx-005A36" />
          <p className="mt-3 text-sm font-semibold text-slate-900">Queued for delivery</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            On its way to +27 {number}. It needs no data to read, so it works on any handset — including a parent's
            phone, or a borrowed one after this device is gone.
          </p>
          <button onClick={onClose} className="mt-5 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">Done</button>
        </div>
      ) : (
        <>
          <p className="text-xs leading-relaxed text-slate-600">
            Your whole plan as plain text: assessment results, the courses you qualify for with their closing dates,
            your Grade 10 subjects, and how to get funding. Enough to keep going without the app.
          </p>

          <div className="mt-3 rounded-xl bg-slate-900 p-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Message preview</p>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-100">{body}</pre>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="text-[10px] text-slate-600">
              {body.length} characters · {segments} SMS segment{segments === 1 ? "" : "s"} · no data required
            </p>
            <button onClick={copy} className="shrink-0 text-[11px] font-semibold k-tx-005A36">
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>

          <div className="mt-3">
            <label htmlFor="sms-num" className="text-xs font-medium text-slate-700">Send to</label>
            <div className="mt-1.5 flex items-stretch gap-2">
              <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <SaStripe />+27
              </span>
              <input id="sms-num" value={number} inputMode="numeric"
                onChange={(e) => setNumber(e.target.value.replace(/[^\d ]/g, "").slice(0, 12))}
                placeholder="71 234 5678"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
            </div>
          </div>

          <button onClick={() => setSent(true)} disabled={number.replace(/\D/g, "").length !== 9}
            className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
            Send SMS summary
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Send it to a parent or guardian too — they often make the application decision.
          </p>
        </>
      )}
    </ModalShell>
  );
}
