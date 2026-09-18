// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { AlertTriangle, Mail, Award } from 'lucide-react';
import { THEME } from '../../theme/tokens';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';
import { VerificationBanner } from './VerificationBanner';
import { RecommendationLetterModal } from './RecommendationLetterModal';

export function MentorWorkspace({ session, requests, setRequests, onVerify, application }) {
  const [letterFor, setLetterFor] = useState(null);
  const [filter, setFilter] = useState("pending");

  const verified = application?.status === "approved";
  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    declined: requests.filter((r) => r.status === "declined").length,
  };
  const shown = requests.filter((r) => r.status === filter);

  const act = (id, status) => setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <div className="space-y-4 p-4 pb-6">
      <VerificationBanner session={session} onVerify={onVerify} application={application} />

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { l: "Awaiting reply", v: counts.pending, c: THEME.gold },
          { l: "Accepted", v: counts.accepted, c: THEME.primary },
          { l: "Letters issued", v: requests.filter((r) => r.letter).length, c: THEME.blue },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-xl font-bold tabular-nums" style={{ color: s.c }}>{s.v}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[["pending", "Pending"], ["accepted", "Accepted"], ["declined", "Declined"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
              filter === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}>{l} ({counts[k]})</button>
        ))}
      </div>

      {!verified && (
        <p className="flex items-start gap-2 rounded-xl k-bg-FBEAE8 p-3 text-[11px] leading-relaxed k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          These requests are shown for demonstration. Until an administrator approves your application you cannot
          accept a learner or issue a letter.
        </p>
      )}

      {shown.length === 0 ? (
        <EmptyState icon={Mail} title={`No ${filter} requests`}
          body="Learner help request letters arrive here with their marks, APS and statement of need attached." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {shown.map((r) => (
            <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{r.from}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-600">Grade {r.grade} · sent {r.sent}</p>
                </div>
                <Pill tone={r.status === "accepted" ? "green" : r.status === "declined" ? "red" : "gold"}>
                  {r.status === "pending" ? "Awaiting your reply" : r.status}
                </Pill>
              </div>

              <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Goal</p>
                  <p className="text-xs text-slate-800">{r.goal}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Subject and marks</p>
                  <p className="text-xs text-slate-800">{r.subject} · {r.marks} · APS {r.aps}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Statement of need</p>
                  <p className="text-xs leading-relaxed text-slate-800">{r.need}</p>
                </div>
              </div>

              {r.letter && <div className="mt-3"><Pill tone="blue" icon={Award}>Recommendation letter issued</Pill></div>}

              <div className="mt-3 flex flex-wrap gap-2">
                {r.status === "pending" && (
                  <>
                    <button onClick={() => act(r.id, "accepted")} disabled={!verified}
                      className="flex-1 rounded-lg k-bg-005A36 py-2 text-[11px] font-semibold text-white k-dis">
                      Accept
                    </button>
                    <button onClick={() => act(r.id, "declined")}
                      className="flex-1 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
                      Decline
                    </button>
                  </>
                )}
                {r.status === "accepted" && !r.letter && (
                  <button onClick={() => setLetterFor(r)} disabled={!verified}
                    className="flex-1 rounded-lg k-bg-1E3A6E py-2 text-[11px] font-semibold text-white k-dis">
                    Issue recommendation letter
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {letterFor && (
        <RecommendationLetterModal request={letterFor} session={session}
          onClose={() => setLetterFor(null)}
          onIssue={(id) => setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, letter: true } : r)))} />
      )}
    </div>
  );
}
