// Wired to the real backend: riskScore/riskVerdict/riskFlags are computed once,
// server-side, at submission time (RiskFlagsService, inside
// MentorApplicationsController.Submit) and never recomputed here. The mock's
// "Request more info" action and its persisted reviewer note are dropped — the
// real MentorApplicationsController only exposes approve/reject, and
// MentorApplication has no note field to persist one in.
import { useState } from 'react';
import { ROLES } from '../../data/roles';
import { VERDICT_STYLE, LEVEL_STYLE } from '../../data/verdictStyles';
import { checkSaId } from '../../engines/saId';
import { Screen } from '../ui/Screen';
import { Pill } from '../ui/Pill';
import { SectionTitle } from '../ui/SectionTitle';
import { downloadApplicationDocument } from '../../lib/api';

/* ---- Application detail ------------------------------------------- */
export function ApplicationDetail({ app, onBack, onApprove, onReject }) {
  const id = checkSaId(app.idNumber);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const v = VERDICT_STYLE[app.riskVerdict] || VERDICT_STYLE.clear;
  const flags = app.riskFlags || [];
  const download = async (kind, filename) => {
    setError('');
    try {
      const blob = await downloadApplicationDocument(app.id, kind);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('The document could not be downloaded. Older applications may need to be resubmitted.'); }
  };

  const rows = [
    ["Full name", app.fullName],
    ["ID / passport", app.idNumber ? `${app.idNumber.slice(0, 6)}••••${app.idNumber.slice(-3)}` : "—"],
    ["ID validation", id.valid ? `Passes checksum · ${id.citizen} · age ${id.age}` : `Fails — ${id.reason}`],
    ["ID document", app.idDocumentFilename || "Not supplied"],
    ["Work email", app.workEmail || "Not supplied"],
    ["Stated employer", app.institution || "—"],
    ["LinkedIn", app.linkedIn || "Not supplied"],
    ["Registration", app.licenceBody !== "none" ? `${app.licenceBody.toUpperCase()} ${app.licenceNumber || "— none given"}` : "None claimed"],
    ["Partner code", app.partnerCode ? `${app.partnerCode}${app.partnerName ? ` (${app.partnerName})` : " — unrecognised"}` : "None"],
    ["Transcript", app.transcriptFilename || "Not supplied"],
    ["Subjects offered", (app.subjects || []).join(", ")],
    ["Time to complete", app.submitSeconds !== undefined ? `${app.submitSeconds} seconds` : "—"],
  ];

  const act = async (fn) => {
    setError(""); setBusy(true);
    try { await fn(); }
    catch (err) { setError(err.message || "Couldn't record that decision. Try again."); setBusy(false); }
  };

  return (
    <Screen onBack={onBack} title={app.fullName}
      subtitle={`${ROLES[app.role]?.label || app.role} · submitted ${new Date(app.submittedAt).toLocaleDateString("en-ZA")}`}>
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
      <div className="mb-3 flex flex-wrap gap-2">
        {app.idDocumentFilename && <button onClick={() => download('identity', app.idDocumentFilename)} className="rounded-lg border p-2 text-xs">Download ID document</button>}
        {app.transcriptFilename && <button onClick={() => download('transcript', app.transcriptFilename)} className="rounded-lg border p-2 text-xs">Download transcript</button>}
      </div>
      {error && <p role="alert" className="my-3 text-xs text-red-700">{error}</p>}
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
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button disabled={busy} onClick={() => act(() => onApprove())}
              className="rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">Approve</button>
            <button disabled={busy} onClick={() => act(() => onReject())}
              className="rounded-xl k-bg-B3261E py-3 text-sm font-semibold text-white k-dis">Reject</button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            Approving grants contact with learners and lists them in the mentor directory. Rejecting does not, and
            the applicant can reapply.
          </p>
        </>
      ) : (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-900">
            {app.status === "approved" ? "Approved" : "Rejected"}
          </p>
          {app.decidedAt && (
            <p className="mt-0.5 text-[11px] text-slate-600">
              An administrator · {new Date(app.decidedAt).toLocaleDateString("en-ZA")}
            </p>
          )}
        </div>
      )}
    </Screen>
  );
}
