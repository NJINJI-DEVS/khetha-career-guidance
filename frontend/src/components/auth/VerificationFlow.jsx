// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { THEME } from '../../theme/tokens';
import { ROLES, PARTNER_CODES, LICENCE_BODIES } from '../../data/roles';
import { ModalShell } from '../ui/ModalShell';
import { Progress } from '../ui/Progress';
import { TierBadges } from '../ui/TierBadges';
import { Pill } from '../ui/Pill';
import { FileDrop } from './FileDrop';

/* ---- Multi-step verification -------------------------------------- */
export function VerificationFlow({ role, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    fullName: "", idNumber: "", idDoc: null,
    workEmail: "", linkedin: "", licenceBody: "none", licenceNumber: "",
    partnerCode: "", transcript: null,
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const idOk = f.fullName.trim().length > 3 &&
    (/^\d{13}$/.test(f.idNumber.replace(/\s/g, "")) || /^[A-Z0-9]{6,12}$/i.test(f.idNumber.trim())) &&
    !!f.idDoc;

  const academicEmail = /@[\w.-]*\.(ac\.za|edu)$/i.test(f.workEmail.trim());
  const corporateEmail = /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(f.workEmail.trim()) && !/@(gmail|yahoo|outlook|hotmail)\./i.test(f.workEmail);
  const partnerName = PARTNER_CODES[f.partnerCode.trim().toUpperCase()] || null;

  const tiers = [
    idOk ? "id" : null,
    f.transcript && (academicEmail || f.licenceNumber.trim()) ? "degree" : null,
    partnerName ? "ngo" : null,
  ].filter(Boolean);

  const credOk = corporateEmail || partnerName || !!f.transcript;

  const titles = { 1: "Personal identity", 2: "Professional credentials", 3: "Review and submit" };

  const input = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37";

  return (
    <ModalShell title={`Verification · ${titles[step]}`} onClose={onCancel} wide>
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[11px] text-slate-600">
          <span>Step {step} of 3</span>
          <span>{ROLES[role].label}</span>
        </div>
        <Progress value={step} max={3} color={THEME.primary} />
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-slate-600">
            We check identity before anything else, because these accounts contact minors. Documents are encrypted
            and visible only to the DHET verification team.
          </p>
          <div>
            <label htmlFor="v-name" className="text-xs font-medium text-slate-700">Full name, as it appears on your ID</label>
            <input id="v-name" value={f.fullName} onChange={(e) => set("fullName", e.target.value)}
              placeholder="Lerato Mokoena" className={input} />
          </div>
          <div>
            <label htmlFor="v-id" className="text-xs font-medium text-slate-700">South African ID or passport number</label>
            <input id="v-id" value={f.idNumber} onChange={(e) => set("idNumber", e.target.value)}
              placeholder="13 digits, or a passport number" className={input} />
            <p className="mt-1 text-[10px] text-slate-600">
              Stored encrypted, never shown to learners, and used only to confirm you are who you say you are.
            </p>
          </div>
          <FileDrop label="ID document photo" hint="Both sides if it is a card."
            value={f.idDoc} onChange={(v) => set("idDoc", v)} />
          {!idOk && (
            <p className="text-[11px] text-slate-600">All three are needed to earn the ID Verified badge.</p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-slate-600">
            Any one of these is enough to proceed. The more you provide, the higher the verification tier on your
            profile, and learners filter on that.
          </p>
          <div>
            <label htmlFor="v-email" className="text-xs font-medium text-slate-700">Work or academic email</label>
            <input id="v-email" type="email" value={f.workEmail} onChange={(e) => set("workEmail", e.target.value)}
              placeholder="l.mokoena@wits.ac.za" className={input} />
            {f.workEmail && (
              <p className={`mt-1 text-[10px] ${academicEmail || corporateEmail ? "k-tx-005A36" : "k-tx-9B1C14"}`}>
                {academicEmail ? "Academic domain recognised — counts toward Degree Verified."
                  : corporateEmail ? "Corporate domain recognised."
                  : "Free email providers cannot be used for verification."}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="v-li" className="text-xs font-medium text-slate-700">LinkedIn profile URL</label>
            <input id="v-li" value={f.linkedin} onChange={(e) => set("linkedin", e.target.value)}
              placeholder="linkedin.com/in/yourname" className={input} />
          </div>
          <div>
            <label htmlFor="v-body" className="text-xs font-medium text-slate-700">Professional registration</label>
            <select id="v-body" value={f.licenceBody} onChange={(e) => set("licenceBody", e.target.value)} className={input}>
              {LICENCE_BODIES.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
            {f.licenceBody !== "none" && (
              <input value={f.licenceNumber} onChange={(e) => set("licenceNumber", e.target.value)}
                placeholder={`${LICENCE_BODIES.find((b) => b.key === f.licenceBody).prefix} registration number`}
                className={input} />
            )}
          </div>
          <div>
            <label htmlFor="v-code" className="text-xs font-medium text-slate-700">Partner NGO or student society access code</label>
            <input id="v-code" value={f.partnerCode} onChange={(e) => set("partnerCode", e.target.value.toUpperCase())}
              placeholder="IKAMVA-2027" className={input} />
            <p className={`mt-1 text-[10px] ${partnerName ? "k-tx-005A36" : "text-slate-600"}`}>
              {partnerName ? `Code recognised — vetted by ${partnerName}.`
                : "Issued by your coordinator. Earns the NGO Vetted badge."}
            </p>
          </div>
          <FileDrop label="Academic transcript or degree certificate" hint="Highest qualification is enough."
            value={f.transcript} onChange={(v) => set("transcript", v)} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-700">What you submitted</p>
            <div className="mt-2 space-y-1 text-[11px]">
              {[
                ["Name", f.fullName || "—"],
                ["ID / passport", f.idNumber ? `••••••${f.idNumber.slice(-4)}` : "—"],
                ["ID document", f.idDoc || "—"],
                ["Work email", f.workEmail || "—"],
                ["LinkedIn", f.linkedin || "—"],
                ["Registration", f.licenceNumber || "—"],
                ["Partner code", partnerName ? `${f.partnerCode} (${partnerName})` : "—"],
                ["Transcript", f.transcript || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-slate-600">{k}</span>
                  <span className="truncate font-medium text-slate-900">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border k-bd-D4AF37 k-bg-FBF5E7 p-3">
            <p className="text-[11px] font-semibold k-tx-6B5307">Badges you will receive</p>
            <div className="mt-2 flex flex-wrap gap-1.5"><TierBadges tiers={tiers} /></div>
            {tiers.length === 0 && (
              <p className="mt-2 text-[11px] k-tx-6B5307">
                Nothing qualifies yet. Go back and add an ID document, a transcript, or a partner access code.
              </p>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-slate-600">
            Your account is live immediately with the badges shown, and learners see exactly which checks passed.
            Manual review by the DHET team follows within five working days and can revoke a badge.
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-900">Back</button>
        )}
        <button
          onClick={() => (step < 3 ? setStep(step + 1) : onComplete({ ...f, tiers, partnerName }))}
          disabled={(step === 1 && !idOk) || (step === 2 && !credOk)}
          className="flex-1 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
          {step < 3 ? "Continue" : "Submit for verification"}
        </button>
      </div>
      {step === 2 && !credOk && (
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Add a work email, a partner code, or a transcript to continue.
        </p>
      )}
    </ModalShell>
  );
}
