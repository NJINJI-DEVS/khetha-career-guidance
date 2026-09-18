// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useMemo } from 'react';
import { ROLES } from '../../data/roles';
import { VERDICT_STYLE, LEVEL_STYLE } from '../../data/verdictStyles';
import { riskFlags } from '../../engines/riskFlags';
import { checkSaId } from '../../engines/saId';
import { Screen } from '../ui/Screen';
import { Pill } from '../ui/Pill';
import { SectionTitle } from '../ui/SectionTitle';

/* ---- Application detail ------------------------------------------- */
export function ApplicationDetail({ app, onBack, onDecide }) {
  const { flags, verdict } = useMemo(() => riskFlags(app), [app]);
  const id = checkSaId(app.idNumber);
  const [note, setNote] = useState("");
  const v = VERDICT_STYLE[verdict];

  const rows = [
    ["Full name", app.fullName],
    ["ID / passport", app.idNumber ? `${app.idNumber.slice(0, 6)}••••${app.idNumber.slice(-3)}` : "—"],
    ["ID validation", id.valid ? `Passes checksum · ${id.citizen} · age ${id.age}` : `Fails — ${id.reason}`],
    ["ID document", app.idDoc || "Not supplied"],
    ["Work email", app.workEmail || "Not supplied"],
    ["Stated employer", app.institution || "—"],
    ["LinkedIn", app.linkedin || "Not supplied"],
    ["Registration", app.licenceBody !== "none" ? `${app.licenceBody.toUpperCase()} ${app.licenceNumber || "— none given"}` : "None claimed"],
    ["Partner code", app.partnerCode ? `${app.partnerCode}${app.partnerName ? ` (${app.partnerName})` : " — unrecognised"}` : "None"],
    ["Transcript", app.transcript || "Not supplied"],
    ["Subjects offered", (app.subjects || []).join(", ")],
    ["Time to complete", app.submitSeconds !== undefined ? `${app.submitSeconds} seconds` : "—"],
  ];

  return (
    <Screen onBack={onBack} title={app.fullName} subtitle={`${ROLES[app.role].label} · submitted ${app.submitted}`}>
      <div className="rounded-2xl border p-4" style={{ borderColor: v.color }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Automated review</p>
            <p className="text-base font-bold" style={{ color: v.color }}>{v.label}</p>
          </div>
          <Pill tone={v.tone}>{flags.length} flag{flags.length === 1 ? "" : "s"}</Pill>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
          These flags point at where to look. They are not a decision — a clean application can still be fraudulent,
          and a flagged one is often just someone with a messy paper trail.
        </p>
      </div>

      {flags.length > 0 && (
        <div className="mt-3 space-y-2">
          {flags.map((f, i) => {
            const L = LEVEL_STYLE[f.level];
            const Icon = L.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${f.level === "high" ? "k-tx-9B1C14" : f.level === "medium" ? "k-tx-6B5307" : "text-slate-500"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900">{f.title}</p>
                    <Pill tone={L.tone}>{L.label}</Pill>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{f.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SectionTitle>What they submitted</SectionTitle>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {rows.map(([k, val]) => (
          <div key={k} className="flex items-start gap-3 p-3">
            <span className="w-32 shrink-0 text-[11px] text-slate-600">{k}</span>
            <span className="flex-1 text-[11px] font-medium text-slate-900">{val}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold text-slate-700">In their own words</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-800">{app.claim}</p>
      </div>

      {app.status === "pending" ? (
        <>
          <div className="mt-4">
            <label htmlFor="dec-note" className="text-xs font-medium text-slate-700">Reviewer note</label>
            <textarea id="dec-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="What you checked, and what decided it. This is kept on the record."
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button onClick={() => onDecide(app.id, "approved", note)}
              className="rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">Approve</button>
            <button onClick={() => onDecide(app.id, "more-info", note)}
              className="rounded-xl k-bg-D4AF37 py-3 text-sm font-semibold text-slate-900">Request more</button>
            <button onClick={() => onDecide(app.id, "rejected", note)}
              className="rounded-xl k-bg-B3261E py-3 text-sm font-semibold text-white">Reject</button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            Approving grants contact with learners. Requesting more keeps the account dormant and tells the applicant
            exactly what is missing, which is the right call whenever the paperwork is thin rather than suspicious.
          </p>
        </>
      ) : (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-900">
            {app.status === "approved" ? "Approved" : app.status === "rejected" ? "Rejected" : "More information requested"}
          </p>
          {app.decidedOn && <p className="mt-0.5 text-[11px] text-slate-600">{app.decidedBy} · {app.decidedOn}</p>}
          {app.note && <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">{app.note}</p>}
        </div>
      )}
    </Screen>
  );
}
