// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { ModalShell } from '../ui/ModalShell';
import { TierBadges } from '../ui/TierBadges';

export function RecommendationLetterModal({ request, session, onClose, onIssue }) {
  const [strength, setStrength] = useState("strong");
  const [body, setBody] = useState(
    `I have worked with ${request.learnerName} on ${request.subject} and can speak to both the work and the circumstances behind the marks. `
  );
  const [issued, setIssued] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const mentorName = session.verification?.fullName || "Verified mentor";
  const tiers = session.verification?.tiers || [];
  const today = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

  const strengths = [
    { key: "strong", label: "Strong recommendation" },
    { key: "qualified", label: "Recommend with reservations" },
    { key: "factual", label: "Factual confirmation only" },
  ];

  if (issued) {
    return (
      <ModalShell title="Letter issued" onClose={onClose}>
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 k-tx-005A36" />
          <p className="mt-3 text-sm font-semibold text-slate-900">Sent to {request.learnerName}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            The letter is attached to their Khetha profile with your verification badges, a reference number and the
            issue date. They can send it with any application, and an institution can check it against the platform.
          </p>
          <button onClick={onClose} className="mt-5 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">Done</button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={`Recommendation letter for ${request.learnerName}`} onClose={onClose} wide>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-slate-700">Strength of recommendation</p>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
            {strengths.map((s) => (
              <button key={s.key} onClick={() => setStrength(s.key)}
                className={`rounded-lg px-2 py-2 text-[11px] font-medium transition-colors ${
                  strength === s.key ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700"
                }`}>{s.label}</button>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-slate-600">
            Honesty is the point. A letter that recommends everyone equally is worth nothing to an admissions officer,
            and learners are not helped by one.
          </p>
        </div>

        <div>
          <label htmlFor="rec-body" className="text-xs font-medium text-slate-700">Your assessment</label>
          <textarea id="rec-body" rows={5} value={body} onChange={(e) => setBody(e.target.value)}
            className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Preview</p>
          <div className="mt-2 space-y-2 text-[11px] leading-relaxed text-slate-800">
            <p className="font-semibold">Khetha verified recommendation · {today}</p>
            <p className="italic text-slate-500">A reference number is generated once you issue this letter.</p>
            <p className="pt-1">To whom it may concern,</p>
            <p>{body}</p>
            <p>
              {request.learnerName}{request.learnerGrade ? ` is in Grade ${request.learnerGrade},` : ""} currently at
              {" "}{request.attachedMarksSummary}, with an APS of {request.attachedAps}.
              Their stated goal is: {request.goal}.
            </p>
            <p>
              {strength === "strong" && "I recommend this learner without reservation."}
              {strength === "qualified" && "I recommend this learner, with the reservations set out above."}
              {strength === "factual" && "This letter confirms the facts above without offering a recommendation."}
            </p>
            <p className="pt-1 font-semibold">{mentorName}</p>
            <div className="flex flex-wrap gap-1.5 pt-1"><TierBadges tiers={tiers} /></div>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-600">
          Issued letters are logged against your account. Fabricating marks or credentials in one is grounds for
          removal from the platform and, where a qualification is involved, referral to the relevant council.
        </p>
      </div>

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}

      <button
        onClick={async () => {
          setError(""); setBusy(true);
          try { await onIssue(strength, body); setIssued(true); }
          catch (err) { setError(err.message || "Couldn't issue this letter. Try again."); }
          finally { setBusy(false); }
        }}
        disabled={body.trim().length < 40 || busy}
        className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        {busy ? "Issuing…" : "Issue letter"}
      </button>
    </ModalShell>
  );
}
