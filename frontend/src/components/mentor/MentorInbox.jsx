// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { Mail } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';

/* ---- Mentor-side dashboard ---------------------------------------- */
export function MentorInbox({ requests, onAct }) {
  if (requests.length === 0) {
    return <EmptyState icon={Mail} title="No incoming requests"
      body="When a learner sends you a help request letter, it lands here with their marks attached." />;
  }
  return (
    <div className="space-y-3">
      {requests.map((r) => (
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

          {r.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <button onClick={() => onAct(r.id, "accepted")}
                className="flex-1 rounded-lg k-bg-005A36 py-2 text-[11px] font-semibold text-white">
                Accept offer
              </button>
              <button onClick={() => onAct(r.id, "declined")}
                className="flex-1 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
                Decline
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
