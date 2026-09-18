// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useEffect } from 'react';
import { CheckCircle2, Check } from 'lucide-react';
import { SUBJECT_LABELS } from '../../data/subjects';
import { ModalShell } from '../ui/ModalShell';

/* ---- AI OCR simulation -------------------------------------------- */
export function OcrScanModal({ learner, detected: detectedProp, onClose, onApply, applyLabel = "Use these marks" }) {
  const [stage, setStage] = useState("aim");
  const [rows, setRows] = useState([]);

  /* Onboarding has no learner yet, so it passes the detected rows directly;
     everywhere else derives them from the profile already on file. */
  const detected = detectedProp
    || (learner?.subjects
      ? learner.subjects.map((s) => ({ label: s.label, pct: s.pct }))
      : Object.entries(learner?.gr9Marks || {}).map(([k, v]) => ({ label: SUBJECT_LABELS[k] || k, pct: v })));

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setStage("reading"), 1100));
    detected.forEach((d, i) => {
      timers.push(setTimeout(() => setRows((r) => [...r, d]), 1400 + i * 260));
    });
    timers.push(setTimeout(() => setStage("done"), 1600 + detected.length * 260));
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ModalShell title="Scan report card" onClose={onClose}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-dashed k-bd-D4AF37 bg-slate-900">
        <div className="absolute inset-x-6 top-6 space-y-2.5 opacity-30">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-2 flex-1 rounded bg-slate-400" />
              <div className="h-2 w-8 rounded bg-slate-400" />
            </div>
          ))}
        </div>
        {stage !== "done" && (
          <div className="absolute inset-x-0 h-0.5 k-bg-D4AF37"
            style={{ top: "20%", animation: "khetha-scan 1.4s ease-in-out infinite alternate" }} />
        )}
        {stage === "done" && (
          <div className="absolute inset-0 grid place-items-center bg-[rgba(0,90,54,0.85)]">
            <CheckCircle2 className="h-12 w-12 k-tx-D4AF37" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 px-3 py-2">
          <p className="text-[11px] text-slate-200">
            {stage === "aim" && "Hold the report card flat inside the frame"}
            {stage === "reading" && "Reading subject names and percentages…"}
            {stage === "done" && `${rows.length} subjects captured`}
          </p>
        </div>
      </div>

      <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5">
            <Check className="h-3.5 w-3.5 shrink-0 k-tx-005A36" />
            <span className="flex-1 text-xs text-slate-700">{r.label}</span>
            <span className="text-xs font-semibold tabular-nums text-slate-900">{r.pct}%</span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="p-4 text-center text-xs text-slate-600">Waiting for the scan…</p>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
        Optical character recognition is simulated in this build. A production version runs on-device so the image
        never leaves the phone, which matters on a shared or borrowed device.
      </p>

      <button onClick={() => onApply(rows)} disabled={stage !== "done"}
        className="mt-3 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        {applyLabel}
      </button>
    </ModalShell>
  );
}
