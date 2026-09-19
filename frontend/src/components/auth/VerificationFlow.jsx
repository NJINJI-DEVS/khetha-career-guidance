// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { THEME } from '../../theme/tokens';
import { ROLES, PARTNER_CODES, LICENCE_BODIES } from '../../data/roles';
import { ModalShell } from '../ui/ModalShell';
import { Progress } from '../ui/Progress';
import { TierBadges } from '../ui/TierBadges';
import { Pill } from '../ui/Pill';
import { DocumentPicker as FileDrop } from './DocumentPicker';
import { FIELDS } from '../../data/fields';

/* ---- Multi-step verification -------------------------------------- */
export function VerificationFlow({ role, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    fullName: "", idNumber: "", idDoc: null,
    workEmail: "", linkedin: "", licenceBody: "none", licenceNumber: "",
    partnerCode: "", transcript: null, institution: '', field: 'stem', subjects: '', claim: '',
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const startedAt = useRef(Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const idOk = f.fullName.trim().length > 3 &&
    (/^\d{13}$/.test(f.idNumber.replace(/\s/g, "")) || /^[A-Z0-9]{6,12}$/i.test(f.idNumber.trim())) &&
    !!f.idDoc;

  const academicEmail = /@[\w.-]*\.(ac\.za|edu)$/i.test(f.workEmail.trim());
  const corporateEmail = /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(f.workEmail.trim()) && !/@(gmail|yahoo|outlook|hotmail)\./i.test(f.workEmail);
  const partnerName = PARTNER_CODES[f.partnerCode.trim().toUpperCase()] || null;

  const tiers = [
    idOk ? "id" : null,
    f.transcript && (academicEmail || f.licenceNumber.trim()) ? "degree" : null,
  ].filter(Boolean);

  const credOk = (corporateEmail || !!f.transcript) && f.institution.trim() && f.subjects.trim() && f.claim.trim();

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
            Supply your identity document for an administrator to review. Your profile stays private until your application is approved.
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
              Used for identity review and never included in your public mentor profile.
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
          <label className="block text-xs font-medium">Institution or employer<input value={f.institution} onChange={(e) => set('institution', e.target.value)} className={input} maxLength={200} /></label>
          <label className="block text-xs font-medium">Career field<select value={f.field} onChange={(e) => set('field', e.target.value)} className={input}>{FIELDS.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}</select></label>
          <label className="block text-xs font-medium">Subjects you can tutor<input value={f.subjects} onChange={(e) => set('subjects', e.target.value)} placeholder="Mathematics, Physical Sciences" className={input} maxLength={500} /></label>
          <label className="block text-xs font-medium">Your experience and how you can help<textarea value={f.claim} onChange={(e) => set('claim', e.target.value)} className={input} maxLength={3000} rows={3} /></label>
          <p className="text-xs leading-relaxed text-slate-600">
            Provide a work email or transcript along with your tutoring details. An administrator will review the evidence before approving your account.
          </p>
          <div>
            <label htmlFor="v-email" className="text-xs font-medium text-slate-700">Work or academic email</label>
            <input id="v-email" type="email" value={f.workEmail} onChange={(e) => set("workEmail", e.target.value)}
              placeholder="l.mokoena@wits.ac.za" className={input} />
            {f.workEmail && (
              <p className={`mt-1 text-[10px] ${academicEmail || corporateEmail ? "k-tx-005A36" : "k-tx-9B1C14"}`}>
                {academicEmail ? "Academic domain recognised — subject to administrator review."
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
              {partnerName ? `Claimed partner: ${partnerName}. An administrator must confirm this separately.`
                : "Optional coordinator reference. A code alone does not verify your credentials."}
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
                ["ID document", f.idDoc?.name || "—"],
                ["Work email", f.workEmail || "—"],
                ["LinkedIn", f.linkedin || "—"],
                ["Registration", f.licenceNumber || "—"],
                ["Partner code", partnerName ? `${f.partnerCode} (${partnerName})` : "—"],
                ["Transcript", f.transcript?.name || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-slate-600">{k}</span>
                  <span className="truncate font-medium text-slate-900">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border k-bd-D4AF37 k-bg-FBF5E7 p-3">
            <p className="text-[11px] font-semibold k-tx-6B5307">Evidence awaiting administrator review</p>
            <p className="mt-2 text-xs k-tx-6B5307">Identity document{f.transcript ? ' and academic transcript' : ''} supplied. Verification badges are awarded only after approval.</p>
            {tiers.length === 0 && (
              <p className="mt-2 text-[11px] k-tx-6B5307">
                Nothing qualifies yet. Go back and add an ID document, a transcript, or a partner access code.
              </p>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-slate-600">
            After submission, your application will show as awaiting approval. You will only appear in the mentor directory and receive learner requests once an administrator approves it.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} disabled={busy}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-900 k-dis-tx">Back</button>
        )}
        <button
          onClick={async () => {
            if (step < 3) { setStep(step + 1); return; }
            setError(""); setBusy(true);
            try {
              await onComplete({
                ...f, tiers, partnerName,
                submitSeconds: Math.round((Date.now() - startedAt.current) / 1000),
              });
            } catch (err) {
              setError(err.message || "Couldn't submit your application. Try again.");
              setBusy(false);
            }
          }}
          disabled={(step === 1 && !idOk) || (step === 2 && !credOk) || busy}
          className="flex-1 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
          {busy ? "Submitting…" : step < 3 ? "Continue" : "Submit for verification"}
        </button>
      </div>
      {step === 2 && !credOk && (
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Complete your institution, subjects and experience, and add a work email or transcript to continue.
        </p>
      )}
    </ModalShell>
  );
}
