// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { SUBJECT_LABELS } from '../../data/subjects';
import { ModalShell } from '../ui/ModalShell';

/* ---- Structured help-request letter ------------------------------- */
export function RequestLetterModal({ mentor, learner, aps, onClose, onSend }) {
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState(mentor.subjects[0]);
  const [need, setNeed] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const marksLine = learner.subjects
    ? learner.subjects.filter((s) => !s.excluded).slice(0, 3).map((s) => `${s.label} ${s.pct}%`).join(", ")
    : Object.entries(learner.gr9Marks || {}).slice(0, 3)
        .map(([k, v]) => `${SUBJECT_LABELS[k] || k} ${v}%`).join(", ");

  const valid = goal.trim().length > 4 && need.trim().length > 15;

  if (sent) {
    return (
      <ModalShell onClose={onClose} title="Request sent">
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 k-tx-005A36" />
          <p className="mt-3 text-sm font-semibold text-slate-900">Your letter is with {mentor.fullName}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Mentors have three working days to accept or decline. You will get a notification either way, and you can
            send a request to another mentor in the meantime.
          </p>
          <button onClick={onClose}
            className="mt-5 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
            Done
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} title={`Help request to ${mentor.fullName}`}>
      <p className="text-xs leading-relaxed text-slate-600">
        Mentors receive a structured letter rather than a chat message, so they can judge quickly whether they are the
        right person. Your marks and APS are attached automatically.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="req-subject" className="text-xs font-medium text-slate-700">Subject you need help with</label>
          <select id="req-subject" value={subject} onChange={(e) => setSubject(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37">
            {mentor.subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="req-goal" className="text-xs font-medium text-slate-700">Your academic goal</label>
          <input id="req-goal" value={goal} onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Get Pure Maths above 60% for a BSc application"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-slate-700">Attached automatically</p>
          <p className="mt-1 text-[11px] text-slate-600">Current marks: {marksLine || "not captured yet"}</p>
          <p className="text-[11px] text-slate-600">APS: {aps || "not applicable in Grade 9"}</p>
          <p className="text-[11px] text-slate-600">Grade {learner.grade}, {learner.school}</p>
        </div>

        <div>
          <label htmlFor="req-need" className="text-xs font-medium text-slate-700">Why you need assistance</label>
          <textarea id="req-need" rows={4} value={need} onChange={(e) => setNeed(e.target.value)}
            placeholder="Be specific. What exactly are you stuck on, and what have you already tried?"
            className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          <p className="mt-1 text-[10px] text-slate-600">{need.trim().length} characters. Mentors accept detailed requests far more often.</p>
        </div>
      </div>

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}

      <button
        onClick={async () => {
          setError(""); setBusy(true);
          try { await onSend({ mentor, goal, subject, need }); setSent(true); }
          catch (err) { setError(err.message || "Couldn't send your request. Try again."); }
          finally { setBusy(false); }
        }}
        disabled={!valid || busy}
        className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        {busy ? "Sending…" : "Send request letter"}
      </button>
      {!valid && (
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Add a goal and a sentence or two on what you are stuck on.
        </p>
      )}
    </ModalShell>
  );
}
