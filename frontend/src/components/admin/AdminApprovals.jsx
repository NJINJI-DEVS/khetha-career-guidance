// Wired to the real backend: risk score/verdict/flags are pre-computed
// server-side (MentorApplicationsController.Submit, via RiskFlagsService) and
// come back on the application itself — no more recomputing riskFlags() locally.
// The mock's "more-info" status/reviewer-note is dropped: the real backend only
// supports approve/reject, nothing else.
import { useState } from 'react';
import { ChevronRight, AlertTriangle, ShieldCheck, ClipboardList } from 'lucide-react';
import { ROLES } from '../../data/roles';
import { VERDICT_STYLE } from '../../data/verdictStyles';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';
import { ApplicationDetail } from './ApplicationDetail';
import { VettingGuide } from './VettingGuide';

/* ==================================================================
   Admin approval queue
   Nothing a mentor submits reaches a learner until a human approves it.
   The flag engine does not decide — it tells the reviewer where to look,
   because the patterns it catches are the ones that recur in
   impersonation attempts.
   ================================================================== */

/* ---- Queue --------------------------------------------------------- */
export function AdminApprovals({ applications, onApprove, onReject }) {
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("pending");

  const open = applications.find((a) => a.id === openId);
  if (open) {
    return (
      <ApplicationDetail app={open} onBack={() => setOpenId(null)}
        onApprove={async () => { await onApprove(open.id); setOpenId(null); }}
        onReject={async () => { await onReject(open.id); setOpenId(null); }} />
    );
  }

  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };
  const shown = applications.filter((a) => a.status === filter);

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">Mentor and professional applications</p>
        <p className="mt-0.5 text-lg font-semibold">{counts.pending} awaiting your decision</p>
        <p className="mt-2 text-[11px] leading-relaxed k-tx-BFE5D4">
          No applicant appears in the mentor directory, and none can receive a learner request, until it is approved
          here.
        </p>
      </div>

      <VettingGuide />

      <div className="grid grid-cols-3 gap-2">
        {[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`rounded-lg px-1.5 py-2 text-[10px] font-semibold transition-colors ${
              filter === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}>{l} ({counts[k]})</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={ClipboardList} title={`No ${filter} applications`}
          body="New mentor and professional sign-ups land here the moment they submit verification." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {shown.map((a) => {
            const v = VERDICT_STYLE[a.riskVerdict] || VERDICT_STYLE.clear;
            const high = (a.riskFlags || []).filter((f) => f.level === "high").length;
            return (
              <button key={a.id} onClick={() => setOpenId(a.id)}
                className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4 text-left"
                style={{ borderLeftColor: v.color }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{a.fullName}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      {ROLES[a.role]?.label || a.role} · {a.institution || "no employer given"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      Submitted {new Date(a.submittedAt).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Pill tone={v.tone}>{v.label}</Pill>
                  {high > 0 && <Pill tone="red" icon={AlertTriangle}>{high} high</Pill>}
                  {a.partnerName && <Pill tone="green" icon={ShieldCheck}>{a.partnerName.split(" ")[0]} vetted</Pill>}
                  {!a.idDocumentFilename && <Pill tone="slate">No ID doc</Pill>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-slate-600">
        Decisions are logged against your administrator account. Approving grants the applicant contact with
        learners; rejecting does not.
      </p>
    </div>
  );
}
