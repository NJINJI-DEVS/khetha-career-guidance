// Wired to the real backend HelpRequestDto shape (learnerName/learnerGrade/
// attachedAps/attachedMarksSummary/hasLetter, denormalized server-side — see
// backend/DTOs/HelpRequestDtos.cs) instead of the mock's from/grade/marks/aps/letter.
import { useState } from 'react';
import { AlertTriangle, Mail, Award } from 'lucide-react';
import { THEME } from '../../theme/tokens';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';
import { VerificationBanner } from './VerificationBanner';
import { MentorEvents } from './MentorEvents';
import { EventRegister } from './EventRegister';
import { RecommendationLetterModal } from './RecommendationLetterModal';

export function MentorWorkspace({ session, requests, onRespond, onIssueLetter, onVerify, application, loading, error, onRefresh }) {
  const [letterFor, setLetterFor] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [actingOn, setActingOn] = useState(null);
  const [registerFor, setRegisterFor] = useState(null);

  if (loading) return <p className="p-6 text-sm text-slate-600">Checking your application…</p>;
  if (error) return <div className="space-y-3 p-6"><p role="alert" className="text-sm text-red-700">Couldn't check your application status.</p><button onClick={onRefresh} className="rounded-lg border p-2">Retry</button></div>;

  const verified = application?.status === "approved";
  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    declined: requests.filter((r) => r.status === "declined").length,
  };
  const shown = requests.filter((r) => r.status === filter);
  const lettersIssued = requests.filter((r) => r.hasLetter).length;

  const act = async (id, accept) => {
    setActingOn(id);
    try { await onRespond(id, accept); } finally { setActingOn(null); }
  };

  if (registerFor) {
    return <EventRegister event={registerFor} onBack={() => setRegisterFor(null)} />;
  }

  return (
    <div className="space-y-4 p-4 pb-6">
      <VerificationBanner session={session} onVerify={onVerify} application={application} />
      <button onClick={onRefresh} className="text-xs font-semibold k-tx-005A36">Refresh application status</button>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { l: "Awaiting reply", v: counts.pending, c: THEME.gold },
          { l: "Accepted", v: counts.accepted, c: THEME.primary },
          { l: "Letters issued", v: lettersIssued, c: THEME.blue },
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
          Until an administrator approves your application you cannot accept a learner or issue a letter.
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
                  <h3 className="text-sm font-semibold text-slate-900">{r.learnerName}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    {r.learnerGrade ? `Grade ${r.learnerGrade} · ` : ""}sent {new Date(r.sentAt).toLocaleDateString("en-ZA")}
                  </p>
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
                  <p className="text-xs text-slate-800">{r.subject} · {r.attachedMarksSummary} · APS {r.attachedAps}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Statement of need</p>
                  <p className="text-xs leading-relaxed text-slate-800">{r.need}</p>
                </div>
              </div>

              {r.hasLetter && <div className="mt-3"><Pill tone="blue" icon={Award}>Recommendation letter issued</Pill></div>}

              <div className="mt-3 flex flex-wrap gap-2">
                {r.status === "pending" && (
                  <>
                    <button onClick={() => act(r.id, true)} disabled={!verified || actingOn === r.id}
                      className="flex-1 rounded-lg k-bg-005A36 py-2 text-[11px] font-semibold text-white k-dis">
                      Accept
                    </button>
                    <button onClick={() => act(r.id, false)} disabled={actingOn === r.id}
                      className="flex-1 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
                      Decline
                    </button>
                  </>
                )}
                {r.status === "accepted" && !r.hasLetter && (
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

      <div className="border-t border-slate-200 pt-4">
        <MentorEvents verified={verified} onOpenRegister={setRegisterFor} />
      </div>

      {letterFor && (
        <RecommendationLetterModal request={letterFor} session={session}
          onClose={() => setLetterFor(null)}
          onIssue={async (strength, body) => { await onIssueLetter(letterFor.id, strength, body); setLetterFor(null); }} />
      )}
    </div>
  );
}
