import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Home, Compass, Wrench, MessageCircle, User, Calculator, Search, Camera, GraduationCap, Briefcase, FlaskConical, ShieldCheck, CalendarClock, ChevronRight, ChevronLeft, Sparkles, Send, Loader2, X, BookOpen, MapPin, Award, AlertTriangle, CheckCircle2, Building2, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Smartphone, KeyRound, LogOut, Heart, Bell, BellRing, Download, WifiOff, Type, Contrast, Languages, Trash2, FileDown, Plug, RefreshCw, Accessibility, ClipboardList, Target, Users, TrendingUp, CircleHelp, PhoneCall, MessageSquare, CalendarDays, Star, Info, Check } from 'lucide-react';
import dhetArms from './assets/dhet-arms.png';
import khethaWordmark from './assets/khetha-wordmark.png';
import { THEME, KHETHA } from './theme/tokens';
import { LANGUAGES, STRINGS } from './data/i18n';
import { NSC_BANDS, SUBJECT_LABELS } from './data/subjects';
import { FIELDS, FIELD } from './data/fields';
import { OCCUPATIONS } from './data/occupations';
import { QUALIFICATIONS } from './data/qualifications';
import { PROVIDER_TYPES, TYPE_COLOR, PROVIDERS, providerById } from './data/providers';
import { CHANNELS, EVENTS, FAQS } from './data/outreach';
import { DEMO_PROFILES } from './data/demoProfiles';
import { MENTOR_ROLES, PARTNERS, partnerById, MENTORS, SEED_REQUESTS } from './data/mentors';
import { RIASEC_TYPES, CAREER_CHOICE_Q, AGREE_SCALE, JOB_FIT_Q } from './data/assessments';
import { PACKAGES } from './data/packages';
import { ROLES, PARTNER_CODES, LICENCE_BODIES, TIERS } from './data/roles';
import { OTP_LENGTH, DEMO_CODE, CONSENT_ITEMS } from './data/auth';
import { JOURNEY } from './data/journey';
import { VIEWPORTS } from './data/viewports';
import { VERDICT_STYLE, LEVEL_STYLE } from './data/verdictStyles';
import { SEED_APPLICATIONS, VETTING_GUIDE } from './data/seedApplications';
import { TELEMETRY } from './data/telemetry';
import { GREETING, SCRIPTS, FALLBACK } from './data/advisorScript';
import { toLevel, bandLabel } from './engines/levels';
import { scoreCareerChoice } from './engines/careerChoice';
import { scoreJobFit } from './engines/jobFit';
import { chooseSubjects, eligibility } from './engines/subjects';
import { checkSaId } from './engines/saId';
import { riskFlags } from './engines/riskFlags';
import { redact } from './engines/redact';
import { buildSmsSummary } from './engines/smsSummary';
import { fmt, pct } from './engines/format';


/* ==================================================================
   Njinji Career Guidance — Khetha NCAP mobile companion
   Built against the DHET challenge brief. Section markers below map
   to the mandatory requirements:
     R1 NCAP reference alignment      R5 Personalised career journey
     R2 Subject Chooser               R6 Inclusivity
     R3 Career Choice / Job Fit       R7 Engagement and notifications
     R4 Three directories             R8 Advice directory and contact
     A1 Secure identity + consent     A2 Data security and privacy
   ================================================================== */

/* ---------- Official government theme ------------------------------ */

/* ==================================================================
   R6: application-wide translation catalogue
   ------------------------------------------------------------------
   Every string the interface itself renders lives here. The advisor
   chat keeps its own separate language, so a learner can read the app
   in Setswana while chatting in English, or the reverse.

   Keys missing from a language fall back to English rather than
   breaking the layout, so a partial translation is always safe to ship.

   Regenerate or extend this catalogue with scripts/translate-with-gemini.mjs.
   Nguni and Sotho strings need review by a first-language speaker before
   this goes in front of the public — see the note in that script.
   ================================================================== */



/* t("stepOf", { n: 2, total: 6 }) -> "Step 2 of 6" */
const useT = (lang) =>
  useCallback(
    (key, vars) => {
      let out = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
      if (vars) Object.entries(vars).forEach(([k, v]) => { out = out.replace(`{${k}}`, v); });
      return out;
    },
    [lang]
  );

/* ---------- NSC scoring (R2, APS tool) ---------------------------- */


/* ---------- R1/R4: NCAP career fields ----------------------------- */

/* ---------- R4a: Careers (occupations) directory ------------------
   Context vector is used by the Job Fit questionnaire (R3):
   people / data / things / outdoors / routine, each 0-4.            */

/* ---------- R4b: What to study (qualifications) -------------------- */

/* ---------- R4c: Where to study (learning providers) --------------- */

const qualById = Object.fromEntries(QUALIFICATIONS.map((q) => [q.id, q]));
const occById = Object.fromEntries(OCCUPATIONS.map((o) => [o.id, o]));

/* ---------- R8: Khetha advice channels and events ------------------ */



/* ---------- Pitch Mode: two hard-coded demo learners ---------------- */

/* ---------- Screen 4: verified mentor, tutor and professional network
   Verification in the MVP rests on institutional partnership rather than
   on self-declared credentials. The roadmap banner in the UI states what
   a production build would add.                                        */



/* Incoming requests shown on the mentor-side dashboard */

/* ==================================================================
   R3: assessment instruments
   ================================================================== */

/* Career Choice — Holland/RIASEC, the model NCAP's own questionnaire
   is built on. Six types, two statements each. */




/* Job Fit — work-context preferences matched against each occupation's
   context vector. Lower distance is a closer fit. */


/* R2: Subject Chooser — maps chosen career fields to the CAPS subjects
   those pathways require, then checks them against Grade 9 marks. */


/* Eligibility of a qualification, given APS and subject marks */

/* ==================================================================
   Shared UI primitives
   ================================================================== */

function Pill({ children, tone = "slate", icon: Icon, style }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    green: "k-bg-E7F4EE k-tx-005A36 k-rg-A8DCC5",
    gold: "k-bg-FBF5E7 k-tx-6B5307 k-rg-E4CE8A",
    navy: "bg-slate-900 text-white ring-slate-900",
    red: "k-bg-FBEAE8 k-tx-9B1C14 k-rg-F2CBC7",
    blue: "k-bg-EAEFF7 k-tx-1E3A6E k-rg-C3CFE4",
  };
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${tones[tone]}`}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}

function SectionTitle({ children, hint }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight text-slate-900">{children}</h2>
      {hint ? <span className="text-xs text-slate-600">{hint}</span> : null}
    </div>
  );
}

function Screen({ title, subtitle, onBack, children, action }) {
  return (
    <div className="p-4 pb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}
      {title && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function FavouriteButton({ on, onToggle, label }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? `Remove ${label} from saved` : `Save ${label}`}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 transition-colors ${
        on ? "k-bg-FBEAE8 k-tx-B3261E k-rg-F2CBC7" : "bg-white text-slate-500 ring-slate-200"
      }`}
    >
      <Heart className={`h-4 w-4 ${on ? "fill-current" : ""}`} />
    </button>
  );
}

function Likert({ value, onChange, name }) {
  return (
    <div className="mt-3 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={name}>
      {AGREE_SCALE.map((s) => (
        <button
          key={s.v}
          role="radio"
          aria-checked={value === s.v}
          onClick={() => onChange(s.v)}
          className={`rounded-lg px-1 py-2 text-[10px] font-medium leading-tight transition-colors ${
            value === s.v
              ? "k-bg-005A36 text-white"
              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function Progress({ value, max, color = KHETHA.green }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.round((value / max) * 100)}%`, background: color }}
      />
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, cta, onCta }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      {Icon && <Icon className="mx-auto h-8 w-8 text-slate-400" />}
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{body}</p>
      {cta && (
        <button
          onClick={onCta}
          className="mt-4 rounded-lg k-bg-005A36 px-4 py-2 text-xs font-semibold text-white"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

function DhetArms({ className = "h-9" }) {
  return (
    <img src={dhetArms} alt="Coat of arms of the Republic of South Africa" className={`${className} w-auto`} />
  );
}
function KhethaWordmark({ className = "h-6" }) {
  return (
    <img src={khethaWordmark} alt="Khetha — make the right choice, decide your future" className={`${className} w-auto`} />
  );
}
function SaStripe() {
  return (
    <span className="flex h-4 w-6 flex-col overflow-hidden rounded-sm" aria-hidden>
      <span className="flex-1 k-bg-B3261E" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 k-bg-1E3A6E" />
    </span>
  );
}

/* ==================================================================
   Multi-role architecture
   ================================================================== */





function TierBadges({ tiers }) {
  if (!tiers || tiers.length === 0) return <Pill tone="slate">Verification pending</Pill>;
  return (
    <>
      {tiers.map((k) => {
        const tier = TIERS[k];
        return <Pill key={k} tone={tier.tone} icon={tier.icon}>{tier.label}</Pill>;
      })}
    </>
  );
}

/* ---- Language picker, shown before anyone has an account ---------- */
function LanguagePicker({ t, lang, setLang, compact }) {
  return (
    <div className={compact ? "" : "rounded-2xl border border-slate-200 bg-white p-3"}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-900">
        <Languages className="h-3.5 w-3.5" />{t("chooseLanguage")}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {LANGUAGES.map((l) => (
          <button key={l.code} onClick={() => setLang(l.code)}
            lang={l.code} aria-pressed={lang === l.code}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              lang === l.code ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
            }`}>
            {l.native}
          </button>
        ))}
      </div>
      {!compact && (
        <p className="mt-2 text-[10px] leading-relaxed text-slate-600">{t("languageHint")}</p>
      )}
    </div>
  );
}

/* ---- Pre-login role selector -------------------------------------- */
function RoleSelector({ t, lang, setLang, onPick }) {
  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
      <div className="flex items-center gap-3">
        <DhetArms className="h-14" />
        <div className="leading-none">
          <p className="text-[15px] font-semibold lowercase leading-tight tracking-tight text-slate-900">
            higher education<br />&amp; training
          </p>
          <p className="mt-1.5 border-t border-slate-300 pt-1.5 text-[9px] leading-tight text-slate-600">
            Department of Higher Education and Training<br />
            <span className="font-semibold text-slate-800">REPUBLIC OF SOUTH AFRICA</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex h-1 w-24 overflow-hidden rounded-full">
        <span className="flex-1 k-bg-005A36" /><span className="flex-1 k-bg-D4AF37" />
        <span className="flex-1 k-bg-1E3A6E" /><span className="flex-1 k-bg-B3261E" />
      </div>

      <div className="mt-5">
        <LanguagePicker t={t} lang={lang} setLang={setLang} />
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{t("howJoining")}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        This decides what the app shows you. Mentors and professionals go through verification before any learner
        can reach them.
      </p>

      <div className="mt-6 grid gap-2.5 lg:grid-cols-2">
        {Object.values(ROLES).map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.key} onClick={() => onPick(r.key)}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-400">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
                style={{ background: r.color }}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{t(r.labelKey)}</span>
                  {r.verifies && <Pill tone="gold">{t("verificationRequired")}</Pill>}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">{t(r.blurbKey)}</span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <p className="flex items-start gap-2 rounded-xl k-bg-E7F4EE p-3 text-[11px] leading-relaxed k-tx-005A36">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          {t("vettedNote")}
        </p>
        <div className="mt-5 flex justify-center"><KhethaWordmark className="h-8" /></div>
      </div>
    </div>
  );
}

/* ---- Simulated file drop ------------------------------------------ */
function FileDrop({ label, hint, value, onChange, accept = "PDF or photo" }) {
  const [busy, setBusy] = useState(false);
  const pick = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onChange(`${label.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    }, 900);
  };
  return (
    <div>
      <p className="text-xs font-medium text-slate-700">{label}</p>
      <button onClick={pick} disabled={busy}
        className={`mt-1.5 flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left ${
          value ? "k-bd-00784A k-bg-E7F4EE" : "border-slate-300 bg-white"
        }`}>
        {busy ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-slate-500" />
          : value ? <CheckCircle2 className="h-5 w-5 shrink-0 k-tx-005A36" />
          : <FileDown className="h-5 w-5 shrink-0 text-slate-500" />}
        <span className="flex-1">
          <span className={`block text-xs font-semibold ${value ? "k-tx-005A36" : "text-slate-900"}`}>
            {busy ? "Uploading…" : value || "Tap to upload"}
          </span>
          <span className="block text-[10px] text-slate-600">{value ? "Received — pending review" : `${accept}. ${hint}`}</span>
        </span>
      </button>
    </div>
  );
}

/* ---- Multi-step verification -------------------------------------- */
function VerificationFlow({ role, onComplete, onCancel }) {
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

/* ==================================================================
   A1 / A2: consent, secure sign-in, two-step verification
   ================================================================== */



function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l-.1.3 6.5 5 .5.1c4.1-3.8 6.6-9.4 6.6-15.7" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-1.9 14.5-5.3l-6.9-5.3c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.9l-.3.1-6.7 5.2-.1.3C7.9 40.9 15.4 46 24 46" />
      <path fill="#FBBC05" d="M11.5 27.7c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4v-.3l-6.8-5.3-.2.1A22 22 0 0 0 2 23.3c0 3.5.9 6.9 2.5 9.9z" />
      <path fill="#EA4335" d="M24 9.5c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 3.3 29.9 1 24 1 15.4 1 7.9 6.1 4.5 13.4l7 5.4C13.3 13.3 18.2 9.5 24 9.5" />
    </svg>
  );
}
function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M16.4 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.6-1.9-1.5-.2-3 .9-3.8.9s-2-.9-3.2-.9c-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 10 .8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9zM14 4.8c.7-.8 1.1-2 1-3.2-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3.1 1.1.1 2.2-.6 2.9-1.4z" />
    </svg>
  );
}

function AuthScreen({ onAuthenticated, role, onBack, t, lang, setLang }) {
  const [step, setStep] = useState("choose");
  const [method, setMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [trustDevice, setTrustDevice] = useState(true);
  const [consent, setConsent] = useState({ core: true, ncap: true, notify: true, research: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const boxes = useRef([]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);
  useEffect(() => {
    if (step === "verify") boxes.current[0]?.focus();
  }, [step]);

  const identity =
    method === "phone" ? `+27 ${phone}`
    : method === "email" ? email
    : method === "google" ? "learner@gmail.com"
    : "Apple ID";
  const channel =
    method === "phone" ? `SMS to +27 ${phone || "•• ••• ••••"}`
    : method === "email" ? `email to ${email || "your inbox"}`
    : "your authenticator app";

  const startVerification = (via) => {
    setError(""); setBusy(true);
    setTimeout(() => {
      setBusy(false); setMethod(via);
      setDigits(Array(OTP_LENGTH).fill("")); setResendIn(30); setStep("verify");
    }, 700);
  };

  const submitCredentials = () => {
    if (method === "email") {
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
      if (password.length < 6) return setError("Your password must be at least 6 characters.");
    }
    if (method === "phone") {
      const d = phone.replace(/\D/g, "");
      if (d.length !== 9) return setError("Enter 9 digits after +27, like 71 234 5678.");
      if (!/^[6-8]/.test(d)) return setError("South African mobile numbers start with 6, 7 or 8.");
    }
    startVerification(method);
  };

  const setDigit = (i, raw) => {
    const v = raw.replace(/\D/g, "").slice(-1);
    setError("");
    setDigits((d) => { const n = [...d]; n[i] = v; return n; });
    if (v && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus();
  };
  const onOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      boxes.current[i - 1]?.focus();
      setDigits((d) => { const n = [...d]; n[i - 1] = ""; return n; });
    }
  };
  const onOtpPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    setDigits(Array(OTP_LENGTH).fill("").map((_, i) => text[i] || ""));
    boxes.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const verify = () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) return setError("Enter all six digits.");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (code === DEMO_CODE) setStep("consent");
      else {
        setError("That code doesn't match. Check your messages and try again.");
        setDigits(Array(OTP_LENGTH).fill("")); boxes.current[0]?.focus();
      }
    }, 600);
  };

  const back = () => {
    setError("");
    if (step === "verify") setStep(method === "google" || method === "apple" ? "choose" : "credentials");
    else setStep("choose");
  };

  const field = "w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37";

  /* ---- method picker ---- */
  if (step === "choose") {
    return (
      <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
        <div className="flex items-center gap-3">
          <DhetArms className="h-14" />
          <div className="leading-none">
            <p className="text-[15px] font-semibold lowercase leading-tight tracking-tight text-slate-900">
              higher education<br />&amp; training
            </p>
            <p className="mt-1.5 border-t border-slate-300 pt-1.5 text-[9px] leading-tight text-slate-600">
              Department of Higher Education and Training<br />
              <span className="font-semibold text-slate-800">REPUBLIC OF SOUTH AFRICA</span>
            </p>
          </div>
        </div>
        <div className="mt-5 flex h-1 w-24 overflow-hidden rounded-full">
          <span className="flex-1 k-bg-00784A" /><span className="flex-1 k-bg-D4AF37" />
          <span className="flex-1 k-bg-1E3A6E" /><span className="flex-1 k-bg-B3261E" />
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">{t("signInTitle")}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {role && ROLES[role]?.verifies ? t("signInSubVerify") : t("signInSub")}
        </p>
        {role && (
          <button onClick={onBack}
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200">
            <ArrowLeft className="h-3.5 w-3.5" />{t("joiningAs")} {t(ROLES[role].labelKey)}
          </button>
        )}

        <div className="mt-4">
          <LanguagePicker t={t} lang={lang} setLang={setLang} compact />
        </div>

        <div className="mt-6 space-y-2.5">
          <button onClick={() => startVerification("google")} disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 k-dis-soft">
            <GoogleMark />{t("continueGoogle")}
          </button>
          <button onClick={() => startVerification("apple")} disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white k-dis-soft">
            <AppleMark />{t("continueApple")}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-medium text-slate-600">{t("or")}</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-2.5">
          <button onClick={() => { setMethod("email"); setError(""); setStep("credentials"); }}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
            <Mail className="h-5 w-5 k-tx-00784A" />
            <span className="flex-1 text-sm font-semibold text-slate-800">{t("continueEmail")}</span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
          <button onClick={() => { setMethod("phone"); setError(""); setStep("credentials"); }}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
            <Phone className="h-5 w-5 k-tx-00784A" />
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-800">{t("continuePhone")}</span>
              <span className="block text-[11px] text-slate-600">Works without data — we send an SMS</span>
            </span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {busy && (
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />Opening secure sign-in
          </p>
        )}

        <div className="mt-auto pt-8">
          <p className="flex items-start gap-2 rounded-xl k-bg-E7F4EE p-3 text-[11px] leading-relaxed k-tx-005A36">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            {t("twoStepNote")}
          </p>
          <div className="mt-5 flex flex-col items-center gap-1.5">
            <KhethaWordmark className="h-8" />
            <p className="text-center text-[11px] leading-relaxed text-slate-600">
              {t("popiaNote")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---- credentials ---- */
  if (step === "credentials") {
    return (
      <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
        <button onClick={back}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
        <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
          {method === "email" ? "Sign in with email" : "Sign in with your phone"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {method === "email"
            ? "Use the address you registered with. New here? The same form creates your account."
            : "Enter a South African mobile number. We'll SMS you a six-digit code."}
        </p>

        <div className="mt-6 space-y-3">
          {method === "email" ? (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="email" inputMode="email" autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.co.za" className={field} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && submitCredentials()}
                  placeholder="Password" className={`${field} pr-11`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-stretch gap-2">
              <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <SaStripe />+27
              </span>
              <input type="tel" inputMode="numeric" autoComplete="tel-national" value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/[^\d ]/g, "").slice(0, 12)); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && submitCredentials()}
                placeholder="71 234 5678"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
            </div>
          )}

          {error && (
            <p className="flex items-start gap-1.5 text-xs k-tx-9B1C14">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
            </p>
          )}

          <button onClick={submitCredentials} disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white transition-colors k-dis">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Sending code" : "Send verification code"}
          </button>
          {method === "email" && (
            <button className="w-full text-center text-xs font-semibold k-tx-005A36">Forgot your password?</button>
          )}
        </div>
      </div>
    );
  }

  /* ---- consent (A2) ---- */
  if (step === "consent") {
    return (
      <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl k-bg-E7F4EE k-tx-005A36">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">What may Khetha keep?</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          You decide before anything is stored. Only the first item is needed for the app to work, and you can change
          the rest whenever you like.
        </p>

        <div className="mt-5 space-y-2.5">
          {CONSENT_ITEMS.map((c) => {
            const on = consent[c.key];
            return (
              <button key={c.key} disabled={c.required}
                onClick={() => setConsent((s) => ({ ...s, [c.key]: !s[c.key] }))}
                className={`flex w-full gap-3 rounded-xl border p-3 text-left transition-colors ${
                  on ? "k-bd-00784A k-bg-E7F4EE" : "border-slate-200 bg-white"
                } ${c.required ? "cursor-default" : ""}`}>
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                  on ? "k-bd-005A36 k-bg-005A36 text-white" : "border-slate-300 bg-white"
                }`}>
                  {on && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {c.label}
                    {c.required && <Pill tone="slate">Required</Pill>}
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-slate-600">{c.body}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 rounded-xl bg-slate-100 p-3 text-[11px] leading-relaxed text-slate-600">
          Your data is encrypted in transit and at rest, stored in South Africa, and never sold. You can export or
          delete everything from Settings at any time.
        </p>

        <button
          onClick={() => onAuthenticated({ method, identity, trustDevice, consent, signedInAt: new Date() })}
          className="mt-5 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Agree and continue
        </button>
      </div>
    );
  }

  /* ---- two-step verification ---- */
  const complete = digits.every(Boolean);
  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
      <button onClick={back}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
        <ArrowLeft className="h-4 w-4" />Back
      </button>
      <span className="mt-5 grid h-12 w-12 place-items-center rounded-2xl k-bg-D4AF37 text-slate-900">
        {method === "phone" ? <Smartphone className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
      </span>
      <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">Step 2 of 2: confirm it's you</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        We sent a six-digit code by {channel}. It expires in 10 minutes.
      </p>

      <div className="mt-6 flex justify-between gap-2" onPaste={onOtpPaste}>
        {digits.map((d, i) => (
          <input key={i} ref={(el) => (boxes.current[i] = el)} value={d}
            onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onOtpKeyDown(i, e)}
            inputMode="numeric" autoComplete="one-time-code" maxLength={1} aria-label={`Digit ${i + 1}`}
            className={`w-full rounded-xl border-2 bg-white py-3 text-center text-lg font-bold tabular-nums text-slate-900 focus:outline-none focus-visible:ring-2 k-fvr-D4AF37 ${
              error ? "k-bd-E5A79F" : d ? "k-bd-00784A" : "border-slate-200"
            }`} />
        ))}
      </div>

      {error && (
        <p className="mt-3 flex items-start gap-1.5 text-xs k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}

      <button onClick={() => setTrustDevice((v) => !v)} className="mt-5 flex items-center gap-2.5 text-left">
        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
          trustDevice ? "k-bd-005A36 k-bg-005A36 text-white" : "border-slate-300 bg-white"
        }`}>
          {trustDevice && <Check className="h-3.5 w-3.5" />}
        </span>
        <span className="text-xs leading-relaxed text-slate-600">
          Trust this phone for 30 days. Only tick this on a device that is yours, not a shared or school computer.
        </span>
      </button>

      <button onClick={verify} disabled={busy || !complete}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white transition-colors k-dis">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Checking code" : "Verify and continue"}
      </button>
      <button onClick={() => setResendIn(30)} disabled={resendIn > 0}
        className="mt-3 w-full text-center text-xs font-semibold k-tx-005A36 k-dis-tx">
        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
      </button>
      <p className="mt-auto rounded-xl bg-slate-100 p-3 text-center text-[11px] leading-relaxed text-slate-600">
        Demo build — the code is {DEMO_CODE}.
      </p>
    </div>
  );
}

/* ==================================================================
   Guided journey — the student is always told what comes next
   ================================================================== */


function useJourney(profile) {
  return useMemo(() => {
    const steps = JOURNEY.map((s) => ({ ...s, complete: s.done(profile) }));
    const next = steps.find((s) => !s.complete) || null;
    const completed = steps.filter((s) => s.complete).length;
    return { steps, next, completed, total: steps.length };
  }, [profile]);
}

/* Sticky prompt so a learner never has to go back to the dashboard */
function NextStepBar({ t, journey, go, onDismiss }) {
  if (!journey.next) {
    return (
      <div className="flex items-center gap-3 border-t k-bd-00784A k-bg-E7F4EE px-4 py-2.5">
        <CheckCircle2 className="h-5 w-5 shrink-0 k-tx-005A36" />
        <p className="flex-1 text-[11px] font-semibold leading-tight k-tx-005A36">
          {t("allStepsDone")}
        </p>
        <button onClick={() => go("sms")}
          className="shrink-0 rounded-lg k-bg-005A36 px-3 py-1.5 text-[11px] font-semibold text-white">
          SMS it
        </button>
      </div>
    );
  }
  const Icon = journey.next.icon;
  return (
    <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
        style={{ background: journey.next.color }}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] leading-tight text-slate-600">
          {t("stepOf", { n: journey.next.n, total: journey.total })}
        </p>
        <p className="truncate text-[12px] font-semibold leading-tight text-slate-900">{t(journey.next.labelKey)}</p>
      </div>
      <button onClick={() => go(journey.next.route)}
        className="flex shrink-0 items-center gap-1 rounded-lg k-bg-005A36 px-3 py-1.5 text-[11px] font-semibold text-white">
        {t("continueBtn")}<ChevronRight className="h-3.5 w-3.5" />
      </button>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Hide the next step prompt"
          className="shrink-0 text-slate-500"><X className="h-4 w-4" /></button>
      )}
    </div>
  );
}

/* Numbered rail shown at the top of the dashboard */
function JourneyRail({ t, journey, go }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {journey.steps.map((s) => {
        const Icon = s.icon;
        const isNext = journey.next?.key === s.key;
        return (
          <button key={s.key} onClick={() => go(s.route)}
            className={`flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors ${
              isNext ? "border-slate-900 bg-white ring-1 ring-slate-900" : "border-slate-200 bg-white"
            }`}>
            <span className="grid h-8 w-8 place-items-center rounded-full"
              style={{ background: s.complete ? s.color : "#E2E8F0", color: s.complete ? "#fff" : "#475569" }}>
              {s.complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className="text-[10px] font-semibold leading-tight text-slate-900">{t(s.shortKey)}</span>
            {isNext && <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600">{t("next")}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* Quick access to the tools, straight from the dashboard */
function ToolsStrip({ t, go, profile }) {
  const tools = [
    { key: "tool:chooser", icon: BookOpen, color: THEME.primary, label: t("subjectChooser"), done: !!profile.subjectResult },
    { key: "tool:choice", icon: Compass, color: THEME.blue, label: t("careerChoice"), done: !!profile.careerChoice },
    { key: "tool:fit", icon: Target, color: THEME.gold, label: t("jobFit"), done: !!profile.jobFit },
    { key: "tab:aps", icon: Calculator, color: THEME.red, label: t("apsCalc"), done: !!profile.apsVisited },
  ];
  return (
    <div>
      <SectionTitle hint={t("tapToOpen")}>{t("careerTools")}</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => go(t.key)}
              className="relative rounded-2xl border border-slate-200 bg-white p-3 text-left">
              <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: t.color }}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-2 text-xs font-semibold leading-tight text-slate-900">{t.label}</p>
              {t.done && (
                <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full k-bg-E7F4EE">
                  <Check className="h-3 w-3 k-tx-005A36" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==================================================================
   Offline: IndexedDB with a localStorage fallback
   ================================================================== */

const IDB_NAME = "njinji-career";
const IDB_STORE = "kv";

function idbOpen() {
  return new Promise((resolve, reject) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) { reject(e); }
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/* Screen the learner opens with no connection at all */
function OfflineCentre({ t, settings, setSettings, packs, togglePack, profile, learner, aps,
                         savedAt, online, installable, onInstall, onSaveNow, storageKind }) {
  const savedCourses = profile.favourites.filter((id) => qualById[id]);
  const savedCareers = profile.favourites.filter((id) => occById[id]);

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className={`rounded-2xl border p-4 ${online ? "border-slate-200 bg-white" : "k-bd-D4AF37 k-bg-FBF5E7"}`}>
        <div className="flex items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${online ? "k-bg-005A36" : "k-bg-D4AF37"}`}>
            {online ? <ShieldCheck className="h-5 w-5" /> : <WifiOff className="h-5 w-5 text-slate-900" />}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {online ? t("connected") : t("noConnection")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {savedAt
                ? `Your data was last saved to this device on ${new Date(savedAt).toLocaleString("en-ZA")}. It opens without a connection.`
                : "Nothing saved to this device yet. Turn on Save to device and your profile stays available offline."}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">{t("storageInUse")}: {storageKind}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={onSaveNow}
            className="flex-1 rounded-lg k-bg-005A36 px-3 py-2 text-[11px] font-semibold text-white">
            {t("saveNow")}
          </button>
          <button onClick={() => setSettings((s) => ({ ...s, saveOffline: !s.saveOffline }))}
            className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-semibold ${
              settings.saveOffline ? "k-bg-E7F4EE k-tx-005A36 ring-1 k-rg-A8DCC5" : "bg-slate-100 text-slate-900"
            }`}>
            {settings.saveOffline ? t("autoSaveOn") : t("autoSaveOff")}
          </button>
        </div>
      </div>

      {/* Install to home screen */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Smartphone className="h-4 w-4" />{t("installHere")}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          Installing puts an icon on your home screen and keeps the app itself on the device, so it opens with no
          connection at all — not just your saved data.
        </p>
        {installable ? (
          <button onClick={onInstall}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-2.5 text-sm font-semibold text-white">
            <Download className="h-4 w-4" />{t("install")}
          </button>
        ) : (
          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-700">Install it manually</p>
            <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-slate-600">
              <li>Android, Chrome: menu ⋮ → Add to Home screen</li>
              <li>iPhone, Safari: Share → Add to Home Screen</li>
              <li>Desktop: the install icon in the address bar</li>
            </ul>
          </div>
        )}
      </div>

      {/* What is available offline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">{t("availableOffline")}</p>
        <div className="mt-3 space-y-2">
          {packs.map((p) => (
            <div key={p.key} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${p.on ? "k-bg-E7F4EE k-tx-005A36" : "bg-slate-200 text-slate-600"}`}>
                {p.on ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              </span>
              <span className="flex-1">
                <span className="block text-xs font-medium text-slate-900">{p.label}</span>
                <span className="block text-[10px] text-slate-600">{p.size}</span>
              </span>
              <button onClick={() => togglePack(p.key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                  p.on ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-white"
                }`}>
                {p.on ? t("done") : t("download")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshot of what is stored */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">{t("yourSavedPlan")}</p>
        <div className="mt-3 space-y-1.5 text-[11px]">
          {[
            ["Learner", `${learner.name}, Grade ${learner.grade}`],
            ["APS", learner.grade === 9 ? "Not applicable yet" : aps],
            ["Subject package", profile.subjectResult ? profile.subjectResult.results[0].title : "Not done"],
            ["Interest code", profile.careerChoice ? profile.careerChoice.code.join("") : "Not done"],
            ["Best job fit", profile.jobFit ? `${profile.jobFit.matches[0].title} (${profile.jobFit.matches[0].fit}%)` : "Not done"],
            ["Saved courses", savedCourses.length],
            ["Saved careers", savedCareers.length],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-slate-600">{k}</span>
              <span className="text-right font-medium text-slate-900">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-600">
        Data is stored on this device only. Signing out or clearing your browser data removes it, and nothing here is
        sent anywhere until you reconnect.
      </p>
    </div>
  );
}

/* ==================================================================
   SMS summary — everything a learner needs if the app is gone
   ================================================================== */


function SmsSummaryModal({ learner, aps, matched, packages, profile, onClose }) {
  const [sent, setSent] = useState(false);
  const [number, setNumber] = useState("");
  const [copied, setCopied] = useState(false);

  const body = useMemo(
    () => buildSmsSummary({ learner, aps, matched, packages, profile }),
    [learner, aps, matched, packages, profile]
  );
  const segments = Math.ceil(body.length / 160);

  const copy = () => {
    try {
      navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };

  return (
    <ModalShell title="SMS summary" onClose={onClose} wide>
      {sent ? (
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 k-tx-005A36" />
          <p className="mt-3 text-sm font-semibold text-slate-900">Queued for delivery</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            On its way to +27 {number}. It needs no data to read, so it works on any handset — including a parent's
            phone, or a borrowed one after this device is gone.
          </p>
          <button onClick={onClose} className="mt-5 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">Done</button>
        </div>
      ) : (
        <>
          <p className="text-xs leading-relaxed text-slate-600">
            Your whole plan as plain text: assessment results, the courses you qualify for with their closing dates,
            your Grade 10 subjects, and how to get funding. Enough to keep going without the app.
          </p>

          <div className="mt-3 rounded-xl bg-slate-900 p-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Message preview</p>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-100">{body}</pre>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="text-[10px] text-slate-600">
              {body.length} characters · {segments} SMS segment{segments === 1 ? "" : "s"} · no data required
            </p>
            <button onClick={copy} className="shrink-0 text-[11px] font-semibold k-tx-005A36">
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>

          <div className="mt-3">
            <label htmlFor="sms-num" className="text-xs font-medium text-slate-700">Send to</label>
            <div className="mt-1.5 flex items-stretch gap-2">
              <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <SaStripe />+27
              </span>
              <input id="sms-num" value={number} inputMode="numeric"
                onChange={(e) => setNumber(e.target.value.replace(/[^\d ]/g, "").slice(0, 12))}
                placeholder="71 234 5678"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
            </div>
          </div>

          <button onClick={() => setSent(true)} disabled={number.replace(/\D/g, "").length !== 9}
            className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
            Send SMS summary
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Send it to a parent or guardian too — they often make the application decision.
          </p>
        </>
      )}
    </ModalShell>
  );
}

/* ==================================================================
   Viewport preview switcher — demo the three layouts on one screen
   ================================================================== */


function ViewportSwitcher({ value, onChange }) {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/95 p-1 shadow-xl">
      <div className="flex items-center gap-0.5">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">View</span>
        {VIEWPORTS.map((v) => {
          const Icon = v.icon;
          const on = value === v.key;
          return (
            <button key={v.key} onClick={() => onChange(v.key)} title={v.label}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                on ? "k-bg-D4AF37 text-slate-900" : "text-slate-300"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==================================================================
   Modals: shell, OCR report-card scan, SMS summary
   ================================================================== */

function ModalShell({ title, onClose, children, wide }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4"
      role="dialog" aria-modal="true" aria-label={title}>
      <div className={`max-h-full w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
          <button onClick={onClose} aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---- AI OCR simulation -------------------------------------------- */
function OcrScanModal({ learner, onClose, onApply }) {
  const [stage, setStage] = useState("aim");
  const [rows, setRows] = useState([]);

  const detected = learner.subjects
    ? learner.subjects.map((s) => ({ label: s.label, pct: s.pct }))
    : Object.entries(learner.gr9Marks || {}).map(([k, v]) => ({ label: SUBJECT_LABELS[k] || k, pct: v }));

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setStage("reading"), 1100));
    detected.forEach((d, i) => {
      timers.push(setTimeout(() => setRows((r) => [...r, d]), 1400 + i * 260));
    });
    timers.push(setTimeout(() => setStage("done"), 1600 + detected.length * 260));
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ModalShell title="Scan report card" onClose={onClose}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-dashed k-bd-D4AF37 bg-slate-900">
        <div className="absolute inset-x-6 top-6 space-y-2.5 opacity-30">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-2 flex-1 rounded bg-slate-400" />
              <div className="h-2 w-8 rounded bg-slate-400" />
            </div>
          ))}
        </div>
        {stage !== "done" && (
          <div className="absolute inset-x-0 h-0.5 k-bg-D4AF37"
            style={{ top: "20%", animation: "njinji-scan 1.4s ease-in-out infinite alternate" }} />
        )}
        {stage === "done" && (
          <div className="absolute inset-0 grid place-items-center bg-[rgba(0,90,54,0.85)]">
            <CheckCircle2 className="h-12 w-12 k-tx-D4AF37" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 px-3 py-2">
          <p className="text-[11px] text-slate-200">
            {stage === "aim" && "Hold the report card flat inside the frame"}
            {stage === "reading" && "Reading subject names and percentages…"}
            {stage === "done" && `${rows.length} subjects captured`}
          </p>
        </div>
      </div>

      <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5">
            <Check className="h-3.5 w-3.5 shrink-0 k-tx-005A36" />
            <span className="flex-1 text-xs text-slate-700">{r.label}</span>
            <span className="text-xs font-semibold tabular-nums text-slate-900">{r.pct}%</span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="p-4 text-center text-xs text-slate-600">Waiting for the scan…</p>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
        Optical character recognition is simulated in this build. A production version runs on-device so the image
        never leaves the phone, which matters on a shared or borrowed device.
      </p>

      <button onClick={onApply} disabled={stage !== "done"}
        className="mt-3 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        Use these marks
      </button>
    </ModalShell>
  );
}

/* ==================================================================
   Screen 1: Dashboard, dual-track selector and onboarding
   ================================================================== */

function Dashboard({ t, learner, profile, go, notifications, offline, aps, eligibleCount, onScan, scanned, onSms, journey }) {
  const isGr9 = learner.grade === 9;
  const packages = isGr9 ? chooseSubjects(learner.gr9Marks, []) : null;
  const done = {
    chooser: !!profile.subjectResult, choice: !!profile.careerChoice,
    fit: !!profile.jobFit, saved: profile.favourites.length > 0,
  };
  const completed = Object.values(done).filter(Boolean).length;
  const unread = notifications.filter((n) => !n.read).slice(0, 2);

  return (
    <div className="space-y-5 p-4 pb-6">
      {/* Learner strip */}
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs k-tx-BFE5D4">{learner.blurb}</p>
            <p className="mt-0.5 truncate text-lg font-semibold">{learner.name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs k-tx-BFE5D4">
              <MapPin className="h-3 w-3" />{learner.school}
            </p>
          </div>
          <div className="shrink-0 rounded-xl k-bg-D4AF37 px-3 py-2 text-center text-slate-900">
            <p className="text-[10px] font-semibold leading-none">{t("grade").toUpperCase()}</p>
            <p className="text-xl font-bold leading-tight">{learner.grade}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">APS</p>
            <p className="text-lg font-bold tabular-nums">{isGr9 ? "—" : aps}</p>
          </div>
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">{t("coursesOpen")}</p>
            <p className="text-lg font-bold tabular-nums">{isGr9 ? "—" : eligibleCount}</p>
          </div>
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Journey</p>
            <p className="text-lg font-bold tabular-nums">{completed}/4</p>
          </div>
        </div>
      </div>

      {offline && (
        <p className="flex items-start gap-2 rounded-xl k-bg-FBF5E7 p-3 text-[11px] leading-relaxed k-tx-6B5307 ring-1 k-rg-E4CE8A">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          Offline mode is active. Your profile, APS, saved courses and the directories are cached on this device. New
          events and mentor replies sync when you reconnect.
        </p>
      )}

      {unread.length > 0 && (
        <div>
          <SectionTitle hint={t("tapToOpen")}>{t("reminders")}</SectionTitle>
          <div className="space-y-2">
            {unread.map((n) => (
              <button key={n.id} onClick={() => go(n.target)}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left">
                <BellRing className="mt-0.5 h-4 w-4 shrink-0 k-tx-B3261E" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{n.title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-600">{n.body}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dual-track selector */}
      <div>
        <SectionTitle hint={t("pickYourStage")}>{t("whereAreYouNow")}</SectionTitle>
        <div className="space-y-3">
          <button onClick={() => go("tool:chooser")}
            className={`w-full rounded-2xl border p-4 text-left transition-colors ${
              isGr9 ? "k-bd-D4AF37 k-bg-FBF5E7" : "border-slate-200 bg-white"
            }`}>
            <div className="flex items-start gap-3">
              <span className="rounded-xl k-bg-005A36 p-2 text-white"><BookOpen className="h-5 w-5" /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{t("trackA")}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {t("trackABody")}
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
            </div>
          </button>

          <button onClick={() => go("tab:aps")}
            className={`w-full rounded-2xl border p-4 text-left transition-colors ${
              !isGr9 ? "k-bd-D4AF37 k-bg-FBF5E7" : "border-slate-200 bg-white"
            }`}>
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-slate-900 p-2 text-white"><GraduationCap className="h-5 w-5" /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{t("trackB")}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {t("trackBBody")}
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
            </div>
          </button>
        </div>
      </div>

      {/* Onboarding actions */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <button onClick={onScan}
          className="flex items-center gap-3 rounded-2xl border border-dashed k-bd-00784A k-bg-E7F4EE p-4 text-left">
          <span className="rounded-xl bg-white p-2 k-tx-005A36 ring-1 k-rg-A8DCC5"><Camera className="h-5 w-5" /></span>
          <span className="flex-1">
            <span className="block text-sm font-semibold k-tx-005A36">{t("scanReport")}</span>
            <span className="block text-xs k-tx-005A36">
              {scanned ? t("scanDone") : t("scanReportBody")}
            </span>
          </span>
          {scanned ? <CheckCircle2 className="h-5 w-5 k-tx-005A36" /> : <Sparkles className="h-5 w-5 k-tx-D4AF37" />}
        </button>

        <button onClick={onSms}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left">
          <span className="rounded-xl bg-slate-900 p-2 text-white"><MessageSquare className="h-5 w-5" /></span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-slate-900">{t("sendSms")}</span>
            <span className="block text-xs text-slate-600">{t("sendSmsBody")}</span>
          </span>
        </button>
      </div>

      {/* Grade 9 package preview */}
      {isGr9 && packages && (
        <div>
          <SectionTitle hint={learner.name.split(" ")[0]}>{t("recommendedPackages")}</SectionTitle>
          <div className="grid gap-3 lg:grid-cols-3">
            {packages.slice(0, 3).map((p, i) => (
              <div key={p.key} className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
                style={{ borderLeftColor: p.color }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                  {i === 0 ? <Pill tone="gold" icon={Award}>{t("bestFit")}</Pill>
                    : <span className="text-xs text-slate-600">{p.readiness}% ready</span>}
                </div>
                <div className="mt-2"><Progress value={p.readiness} max={100} color={p.color} /></div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.subjects.map((s) => <Pill key={s}>{SUBJECT_LABELS[s]}</Pill>)}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guided journey */}
      <div>
        <SectionTitle hint={`${journey.completed}/${journey.total}`}>{t("myJourney")}</SectionTitle>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3"><Progress value={journey.completed} max={journey.total} color={THEME.gold} /></div>
          <JourneyRail t={t} journey={journey} go={go} />
          {journey.next ? (
            <div className="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white"
                style={{ background: journey.next.color }}>
                {React.createElement(journey.next.icon, { className: "h-4 w-4" })}
              </span>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {t("stepOf", { n: journey.next.n, total: journey.total })}
                </p>
                <p className="text-sm font-semibold text-slate-900">{t(journey.next.labelKey)}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{t(journey.next.bodyKey)}</p>
                <button onClick={() => go(journey.next.route)}
                  className="mt-2 flex items-center gap-1 rounded-lg k-bg-005A36 px-3 py-1.5 text-[11px] font-semibold text-white">
                  {t("startThisStep")}<ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 flex items-start gap-2 rounded-xl k-bg-E7F4EE p-3 text-[11px] leading-relaxed k-tx-005A36">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Every step is done. Send yourself the SMS summary so your plan survives a flat battery.
            </p>
          )}
        </div>
      </div>

      <ToolsStrip t={t} go={go} profile={profile} />

      <div>
        <SectionTitle hint="NCAP">{t("browseByField")}</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
          {FIELDS.map((f) => {
            const Icon = f.icon;
            return (
              <button key={f.key} onClick={() => go(`field:${f.key}`)}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-left">
                <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: f.color, color: "#fff" }}>
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-2 text-xs font-semibold leading-tight text-slate-900">{f.label}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {OCCUPATIONS.filter((o) => o.field === f.key).length} careers
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={() => go("advice")}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed k-bd-00784A k-bg-E7F4EE p-4 text-left">
        <span className="rounded-xl bg-white p-2 k-tx-005A36 ring-1 k-rg-A8DCC5"><PhoneCall className="h-5 w-5" /></span>
        <span className="flex-1">
          <span className="block text-sm font-semibold k-tx-005A36">{t("talkToPerson")}</span>
          <span className="block text-xs k-tx-005A36">{t("talkToPersonBody")}</span>
        </span>
        <ChevronRight className="h-4 w-4 k-tx-005A36" />
      </button>
    </div>
  );
}

/* ==================================================================
   R5 / R7: Home — the personalised career journey
   ================================================================== */

function JourneyStep({ n, title, body, done, cta, onCta, color }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold"
          style={{ background: done ? color : "#E2E8F0", color: done ? "#FFFFFF" : "#475569" }}>
          {done ? <Check className="h-4 w-4" /> : n}
        </span>
        {n < 4 && <span className="my-1 w-px flex-1 bg-slate-200" />}
      </div>
      <div className="flex-1 pb-5">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{body}</p>
        {!done && cta && (
          <button onClick={onCta}
            className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white">
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}

/* ==================================================================
   R2: Subject Chooser
   ================================================================== */

const GR9_SUBJECTS = [
  { key: "maths", label: "Mathematics" },
  { key: "lifesci", label: "Natural Sciences" },
  { key: "english", label: "English" },
  { key: "ems", label: "Economic & Management Sciences" },
  { key: "tech", label: "Technology" },
  { key: "social", label: "Social Sciences" },
];

function SubjectChooser({ onBack, onSave, saved }) {
  const [step, setStep] = useState(saved ? 3 : 0);
  const [interests, setInterests] = useState(saved?.interests || []);
  const [marks, setMarks] = useState(
    saved?.marks || { maths: 48, lifesci: 52, english: 58, ems: 61, tech: 55, social: 60 }
  );
  const [scanning, setScanning] = useState(false);

  const results = useMemo(() => chooseSubjects(marks, interests), [marks, interests]);

  const toggle = (k) =>
    setInterests((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  if (step === 0) {
    return (
      <Screen onBack={onBack} title="Subject Chooser"
        subtitle="Three short steps. We match your Grade 9 marks to the Grade 10 package that opens the careers you actually want.">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Why this matters</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Your Grade 10 subject package decides which qualifications you can apply for three years later. Changing it
            after Grade 10 is difficult, and some doors — engineering, medicine, chartered accountancy — close
            permanently without Pure Mathematics and Physical Sciences.
          </p>
        </div>
        <button onClick={() => setStep(1)}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Start
        </button>
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen onBack={() => setStep(0)} title="Step 1 of 3: what interests you?"
        subtitle="Pick as many as you like. Leave it blank and we will compare all six packages.">
        <div className="space-y-2.5">
          {Object.values(PACKAGES).map((p) => {
            const on = interests.includes(p.key);
            return (
              <button key={p.key} onClick={() => toggle(p.key)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  on ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
                }`}>
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded"
                  style={{ background: on ? p.color : "#E2E8F0" }} />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{p.title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-600">{p.opens}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setStep(2)}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Next
        </button>
      </Screen>
    );
  }

  if (step === 2) {
    return (
      <Screen onBack={() => setStep(1)} title="Step 2 of 3: your Grade 9 marks"
        subtitle="Enter your latest report marks, or scan the report card and we will read them for you.">
        <button onClick={() => { setScanning(true); setTimeout(() => setScanning(false), 1800); }}
          className="mb-4 flex w-full items-center gap-3 rounded-xl border border-dashed k-bd-00784A k-bg-E7F4EE p-3 text-left">
          <Camera className="h-5 w-5 k-tx-005A36" />
          <span className="flex-1 text-sm font-semibold k-tx-005A36">
            {scanning ? "Reading your report card…" : "Scan report card"}
          </span>
          {scanning ? <Loader2 className="h-4 w-4 animate-spin k-tx-005A36" /> : <Sparkles className="h-4 w-4 k-tx-D4AF37" />}
        </button>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          {GR9_SUBJECTS.map((s) => (
            <div key={s.key}>
              <div className="flex items-center justify-between">
                <label htmlFor={`m-${s.key}`} className="text-xs font-medium text-slate-700">{s.label}</label>
                <span className="text-xs font-semibold tabular-nums text-slate-900">{marks[s.key]}%</span>
              </div>
              <input id={`m-${s.key}`} type="range" min={0} max={100} value={marks[s.key]}
                onChange={(e) => setMarks((m) => ({ ...m, [s.key]: Number(e.target.value) }))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 k-ac-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
            </div>
          ))}
        </div>
        <button onClick={() => { setStep(3); onSave({ interests, marks, results: chooseSubjects(marks, interests) }); }}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          See my packages
        </button>
      </Screen>
    );
  }

  return (
    <Screen onBack={onBack} title="Your Grade 10 packages"
      subtitle="Ranked by how ready your current marks are for each pathway."
      action={
        <button onClick={() => setStep(1)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200">
          Redo
        </button>
      }>
      <div className="space-y-3">
        {results.map((p, i) => (
          <div key={p.key} className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
            style={{ borderLeftColor: p.color }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{p.title}</p>
              {i === 0 ? <Pill tone="gold" icon={Award}>Best fit</Pill> : <span className="text-xs text-slate-600">{p.readiness}% ready</span>}
            </div>
            <div className="mt-2"><Progress value={p.readiness} max={100} color={p.color} /></div>

            <div className="mt-3 space-y-1.5">
              {p.gates.map((g) => (
                <p key={g.subject} className={`flex items-center gap-1.5 text-[11px] ${g.met ? "k-tx-005A36" : "k-tx-6B5307"}`}>
                  {g.met ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                  {SUBJECT_LABELS[g.subject] || g.subject}: you have {g.got ?? "—"}%, this package wants {g.min}%
                </p>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.subjects.map((s) => <Pill key={s}>{SUBJECT_LABELS[s]}</Pill>)}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{p.note}</p>
            <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-600">Opens: {p.opens}</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* ==================================================================
   R3: Career Choice and Job Fit questionnaires
   ================================================================== */

function Questionnaire({ kind, onBack, onSave, saved }) {
  const config = kind === "choice"
    ? { title: "Career Choice", questions: CAREER_CHOICE_Q, score: scoreCareerChoice,
        intro: "Twelve statements about what you enjoy. There are no right answers — answer for yourself, not for the job you think you should want.", perPage: 4 }
    : { title: "Job Fit", questions: JOB_FIT_Q, score: scoreJobFit,
        intro: "Ten statements about how and where you want to work. This matches you to the day-to-day reality of an occupation, not just the title.", perPage: 5 };

  const [answers, setAnswers] = useState(saved?.answers || {});
  const [page, setPage] = useState(saved ? -1 : 0);
  const pages = Math.ceil(config.questions.length / config.perPage);
  const slice = config.questions.slice(page * config.perPage, (page + 1) * config.perPage);
  const answered = Object.keys(answers).length;
  const pageDone = slice.every((q) => answers[q.id]);

  const finish = () => {
    const result = { answers, ...config.score(answers) };
    onSave(result);
    setPage(-1);
  };

  /* ---- results ---- */
  if (page === -1) {
    const result = saved && saved.answers === answers ? saved : { answers, ...config.score(answers) };
    return (
      <Screen onBack={onBack} title={`${config.title} results`}
        action={
          <button onClick={() => { setAnswers({}); setPage(0); }}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200">
            Retake
          </button>
        }>
        {kind === "choice" ? (
          <>
            <div className="rounded-2xl bg-slate-900 p-4 text-white">
              <p className="text-xs text-slate-300">Your interest code</p>
              <p className="mt-1 text-3xl font-bold tracking-widest k-tx-D4AF37">{result.code.join("")}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                {result.code.map((c) => RIASEC_TYPES[c].label).join(" · ")}
              </p>
            </div>
            <div className="mt-4 space-y-2.5">
              {result.ranked.map((r) => (
                <div key={r.type} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{RIASEC_TYPES[r.type].label}</p>
                    <span className="text-xs font-semibold tabular-nums text-slate-700">{r.pct}%</span>
                  </div>
                  <div className="mt-2"><Progress value={r.pct} max={100} color={result.code.includes(r.type) ? KHETHA.green : "#CBD5E1"} /></div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{RIASEC_TYPES[r.type].blurb}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <p className="text-xs text-slate-300">Your work preferences</p>
            <div className="mt-3 space-y-2.5">
              {Object.entries(result.profile).map(([axis, v]) => (
                <div key={axis}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="capitalize text-slate-300">{axis === "things" ? "hands-on work" : axis}</span>
                    <span className="font-semibold tabular-nums">{v}/4</span>
                  </div>
                  <div className="mt-1"><Progress value={v} max={4} color={KHETHA.gold} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <SectionTitle hint="Tap to open">Careers that match</SectionTitle>
        <div className="space-y-2.5">
          {result.matches.slice(0, 6).map((o) => (
            <div key={o.id} className="rounded-xl border border-l-4 border-slate-200 bg-white p-3"
              style={{ borderLeftColor: FIELD[o.field].color }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{o.title}</p>
                <Pill tone="green">{kind === "fit" ? `${o.fit}% fit` : `${o.riasec.join("")}`}</Pill>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{o.summary}</p>
            </div>
          ))}
        </div>
      </Screen>
    );
  }

  /* ---- questions ---- */
  return (
    <Screen onBack={page === 0 ? onBack : () => setPage((p) => p - 1)} title={config.title}>
      <p className="-mt-2 mb-3 text-sm leading-relaxed text-slate-600">{config.intro}</p>
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[11px] text-slate-600">
          <span>Question {page * config.perPage + 1}–{Math.min((page + 1) * config.perPage, config.questions.length)} of {config.questions.length}</span>
          <span>{answered} answered</span>
        </div>
        <Progress value={answered} max={config.questions.length} color={KHETHA.blue} />
      </div>

      <div className="space-y-3">
        {slice.map((q) => (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm leading-relaxed text-slate-900">{q.text}</p>
            <Likert name={q.text} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
          </div>
        ))}
      </div>

      <button
        onClick={() => (page + 1 < pages ? setPage(page + 1) : finish())}
        disabled={!pageDone}
        className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white transition-colors k-dis">
        {page + 1 < pages ? "Next questions" : "See my results"}
      </button>
      {!pageDone && (
        <p className="mt-2 text-center text-[11px] text-slate-600">Answer every statement on this page to continue.</p>
      )}
    </Screen>
  );
}

/* ==================================================================
   APS calculator and what-if simulator
   ================================================================== */

function ApsCalculator({ onBack, subjects, setSubjects, mathsIsPure, setMathsIsPure, aps, counts, onExplore }) {
  const update = (key, pct) =>
    setSubjects((prev) => prev.map((s) => (s.key === key ? { ...s, pct } : s)));

  return (
    <Screen onBack={onBack} title="APS calculator"
      subtitle="Drag any subject and watch the qualifications open and close in real time.">
      <div className="rounded-2xl bg-slate-900 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300">Admission Point Score</p>
            <p className="text-4xl font-bold tabular-nums k-tx-D4AF37">{aps}</p>
            <p className="mt-1 text-[11px] text-slate-300">Best six subjects, Life Orientation excluded</p>
          </div>
          <div className="space-y-2 text-right">
            <div>
              <p className="text-[11px] text-slate-300">Degrees</p>
              <p className="text-xl font-semibold tabular-nums">{counts.university}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-300">Diplomas</p>
              <p className="text-xl font-semibold tabular-nums">{counts.uot + counts.tvet}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Mathematics stream</p>
        <p className="mt-1 text-xs text-slate-600">
          This choice alone decides whether engineering, actuarial science and computer science stay open.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[{ v: true, label: "Pure Mathematics" }, { v: false, label: "Mathematical Literacy" }].map((o) => (
            <button key={o.label} onClick={() => setMathsIsPure(o.v)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                mathsIsPure === o.v ? "k-bd-005A36 k-bg-005A36 text-white" : "border-slate-200 bg-white text-slate-700"
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <SectionTitle hint="Drag to simulate">What-if simulator</SectionTitle>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        {subjects.map((s) => (
          <div key={s.key}>
            <div className="flex items-center justify-between">
              <label htmlFor={`aps-${s.key}`} className="text-xs font-medium text-slate-700">
                {s.key === "maths" && !mathsIsPure ? "Mathematical Literacy" : s.label}
                {s.excluded && <span className="ml-1 text-[10px] text-slate-500">(not counted)</span>}
              </label>
              <span className="flex items-center gap-2">
                <span className="text-xs font-semibold tabular-nums text-slate-900">{s.pct}%</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  s.excluded ? "bg-slate-100 text-slate-500" : "k-bg-F4E8C9 k-tx-6B5307"
                }`}>L{toLevel(s.pct)}</span>
              </span>
            </div>
            <input id={`aps-${s.key}`} type="range" min={0} max={100} value={s.pct}
              onChange={(e) => update(s.key, Number(e.target.value))}
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 k-ac-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">NSC level scale</p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {NSC_BANDS.filter((b) => b.level >= 2).map((b) => (
            <div key={b.level} className="flex items-center gap-2">
              <span className="w-6 rounded bg-slate-900 py-0.5 text-center text-[10px] font-bold text-white">L{b.level}</span>
              <span className="text-[11px] text-slate-600">{b.min}–{b.level === 7 ? 100 : b.min + 9}%</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onExplore}
        className="mt-4 w-full rounded-xl k-bg-005A36 px-4 py-3 text-sm font-semibold text-white">
        See the {counts.university + counts.uot + counts.tvet} qualifications you meet
      </button>
    </Screen>
  );
}

function ToolsHub({ t, go, profile }) {
  const tools = [
    { key: "chooser", icon: BookOpen, color: KHETHA.green, title: t("subjectChooser"),
      body: "Grade 9 marks and interests to a Grade 10 package.", done: !!profile.subjectResult },
    { key: "choice", icon: Compass, color: KHETHA.blue, title: t("careerChoice"),
      body: "Twelve questions on what you enjoy, scored on six interest types.", done: !!profile.careerChoice },
    { key: "fit", icon: Target, color: KHETHA.gold, title: t("jobFit"),
      body: "How and where you want to work, matched to real occupations.", done: !!profile.jobFit },
    { key: "aps", icon: Calculator, color: KHETHA.red, title: t("apsCalc"),
      body: "Calculate your NSC score and simulate better marks.", done: false },
  ];
  return (
    <div className="space-y-3 p-4 pb-6">
      <SectionTitle hint="All four work offline">Career tools</SectionTitle>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button key={tool.key} onClick={() => go(`tool:${tool.key}`)}
            className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ background: tool.color, color: tool.key === "fit" ? KHETHA.ink : "#fff" }}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{tool.title}</span>
                {tool.done && <Pill tone="green" icon={Check}>Done</Pill>}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-600">{tool.body}</span>
            </span>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
          </button>
        );
      })}
    </div>
  );
}

/* ==================================================================
   R4: Careers, What to study, Where to study — plus R8 advice
   ================================================================== */

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
    </div>
  );
}

function Chips({ options, value, onChange, colorFor }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {options.map((o) => {
        const on = value === o.key;
        const c = colorFor?.(o.key);
        return (
          <button key={o.key} onClick={() => onChange(o.key)}
            style={on && c ? { background: c, color: c === KHETHA.gold ? KHETHA.ink : "#fff" } : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              on ? (c ? "" : "k-bg-005A36 text-white") : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function CareersDirectory({ fav, toggleFav, onOpen, fieldFilter, setFieldFilter }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return OCCUPATIONS
      .filter((o) => (fieldFilter === "all" ? true : o.field === fieldFilter))
      .filter((o) => !s || o.title.toLowerCase().includes(s) || o.summary.toLowerCase().includes(s) || o.ofo.includes(s));
  }, [q, fieldFilter]);

  return (
    <div className="space-y-3">
      <SearchBar value={q} onChange={setQ} placeholder="Search a career, or an OFO code" />
      <Chips value={fieldFilter} onChange={setFieldFilter}
        colorFor={(k) => FIELD[k]?.color}
        options={[{ key: "all", label: "All fields" }, ...FIELDS.map((f) => ({ key: f.key, label: f.label }))]} />
      <p className="text-xs text-slate-600">{results.length} careers</p>
      {results.map((o) => (
        <article key={o.id} className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
          style={{ borderLeftColor: FIELD[o.field].color }}>
          <div className="flex items-start gap-3">
            <button onClick={() => onOpen(o.id)} className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-slate-900">{o.title}</h3>
              <p className="mt-0.5 text-[11px] text-slate-600">{FIELD[o.field].label} · OFO {o.ofo}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{o.summary}</p>
            </button>
            <FavouriteButton on={fav.includes(o.id)} onToggle={() => toggleFav(o.id)} label={o.title} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone={o.demand === "Scarce skill" ? "red" : "slate"} icon={TrendingUp}>{o.demand}</Pill>
            <Pill tone="slate">{o.salary}</Pill>
          </div>
        </article>
      ))}
      {results.length === 0 && (
        <EmptyState icon={Search} title="No careers match that"
          body="Try a broader word, or clear the field filter to see all twelve." />
      )}
    </div>
  );
}

function QualificationsDirectory({ ctx, fav, toggleFav, onOpen }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [gateway, setGateway] = useState("any");
  const [onlyEligible, setOnlyEligible] = useState(false);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return QUALIFICATIONS
      .map((x) => ({ ...x, provider: providerById[x.providerId], ...eligibility(x, ctx) }))
      .filter((x) => (type === "all" ? true : x.provider.type === type))
      .filter((x) => (gateway === "any" ? true : gateway === "pure" ? x.pureMathsOnly : !x.pureMathsOnly))
      .filter((x) => (onlyEligible ? x.eligible : true))
      .filter((x) => !s || x.title.toLowerCase().includes(s) || x.provider.name.toLowerCase().includes(s))
      .sort((a, b) => Number(b.eligible) - Number(a.eligible));
  }, [q, type, gateway, onlyEligible, ctx]);

  return (
    <div className="space-y-3">
      <SearchBar value={q} onChange={setQ} placeholder="Search a qualification or institution" />
      <Chips value={type} onChange={setType} colorFor={(k) => TYPE_COLOR[k]}
        options={[{ key: "all", label: "All" }, { key: "university", label: "Universities" },
                  { key: "uot", label: "UoTs" }, { key: "tvet", label: "TVET" }, { key: "cet", label: "CET" }]} />
      <div className="flex flex-wrap items-center gap-2">
        {[{ key: "any", label: "Any maths" }, { key: "pure", label: "Pure Maths required" }, { key: "lit", label: "Maths Lit allowed" }].map((g) => (
          <button key={g.key} onClick={() => setGateway(g.key)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
              gateway === g.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}>{g.label}</button>
        ))}
        <button onClick={() => setOnlyEligible((v) => !v)}
          className={`ml-auto rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
            onlyEligible ? "k-bg-D4AF37 text-slate-900" : "bg-slate-100 text-slate-700"
          }`}>I qualify only</button>
      </div>
      <p className="text-xs text-slate-600">
        {results.length} qualifications · {results.filter((r) => r.eligible).length} you qualify for today
      </p>

      {results.map((c) => (
        <article key={c.id}
          className={`rounded-2xl border border-l-4 bg-white p-4 ${c.eligible ? "border-slate-200 ring-1 k-rg-00784A" : "border-slate-200"}`}
          style={{ borderLeftColor: TYPE_COLOR[c.provider.type] }}>
          <div className="flex items-start gap-3">
            <button onClick={() => onOpen(c.id)} className="flex-1 text-left">
              <h3 className="text-sm font-semibold leading-snug text-slate-900">{c.title}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                <Building2 className="h-3 w-3" />{c.provider.name}
              </p>
            </button>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="rounded-xl px-2.5 py-1.5 text-center"
                style={{ background: TYPE_COLOR[c.provider.type], color: c.provider.type === "uot" ? KHETHA.ink : "#fff" }}>
                <p className="text-[9px] leading-none opacity-80">APS</p>
                <p className="text-sm font-bold leading-tight">{c.minAPS}</p>
              </div>
              <FavouriteButton on={fav.includes(c.id)} onToggle={() => toggleFav(c.id)} label={c.title} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="slate">NQF {c.nqf}</Pill>
            <Pill tone="slate">{c.duration}</Pill>
            {c.pureMathsOnly && <Pill tone="gold">Pure Maths only</Pill>}
            {Object.entries(c.requires).map(([k, v]) => (
              <Pill key={k}>{`${SUBJECT_LABELS[k]} ≥ ${v}%`}</Pill>
            ))}
            {c.nsfas ? <Pill tone="green" icon={ShieldCheck}>NSFAS accredited</Pill> : <Pill tone="red">Self-funded</Pill>}
            <Pill tone="navy" icon={CalendarClock}>Closes {c.deadline}</Pill>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            {c.eligible ? (
              <p className="flex items-center gap-1.5 text-xs font-medium k-tx-005A36">
                <CheckCircle2 className="h-4 w-4" />You meet every requirement. Apply before {c.deadline}.
              </p>
            ) : (
              <p className="flex items-start gap-1.5 text-xs k-tx-6B5307">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Still needed: {c.unmet.join(" · ")}</span>
              </p>
            )}
          </div>
        </article>
      ))}
      {results.length === 0 && (
        <EmptyState icon={GraduationCap} title="Nothing matches those filters"
          body="Clear the search or switch back to All to widen the list." />
      )}
    </div>
  );
}

const PROVINCES = ["All", "Gauteng", "KwaZulu-Natal", "Western Cape", "National"];

function ProvidersDirectory({ fav, toggleFav }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [province, setProvince] = useState("All");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return PROVIDERS
      .filter((p) => (type === "all" ? true : p.type === type))
      .filter((p) => (province === "All" ? true : p.province === province))
      .filter((p) => !s || p.name.toLowerCase().includes(s) || p.city.toLowerCase().includes(s));
  }, [q, type, province]);

  return (
    <div className="space-y-3">
      <SearchBar value={q} onChange={setQ} placeholder="Search an institution or town" />
      <Chips value={type} onChange={setType} colorFor={(k) => TYPE_COLOR[k]}
        options={[{ key: "all", label: "All" }, { key: "university", label: "Universities" },
                  { key: "uot", label: "UoTs" }, { key: "tvet", label: "TVET" }, { key: "cet", label: "CET" }]} />
      <Chips value={province} onChange={setProvince}
        options={PROVINCES.map((p) => ({ key: p, label: p }))} />
      <p className="text-xs text-slate-600">{results.length} learning providers</p>

      {results.map((p) => (
        <article key={p.id} className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
          style={{ borderLeftColor: TYPE_COLOR[p.type] }}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">{p.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
                <MapPin className="h-3 w-3" />{p.city}, {p.province}
              </p>
            </div>
            <FavouriteButton on={fav.includes(p.id)} onToggle={() => toggleFav(p.id)} label={p.name} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="slate">{PROVIDER_TYPES[p.type]}</Pill>
            {p.nsfas && <Pill tone="green" icon={ShieldCheck}>NSFAS</Pill>}
            {p.residence && <Pill tone="slate">Residence available</Pill>}
            <Pill tone="slate">
              {QUALIFICATIONS.filter((q) => q.providerId === p.id).length} qualifications listed
            </Pill>
          </div>
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
            <a href={`tel:${p.phone.replace(/\s/g, "")}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
              <Phone className="h-3.5 w-3.5" />{p.phone}
            </a>
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
              <Compass className="h-3.5 w-3.5" />{p.site}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ---------- R8: advice directory, events, contact channels --------- */
function AdviceDirectory({ notify }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle hint="Free to call">Reach a career practitioner</SectionTitle>
        <div className="space-y-2.5">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            const inner = (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-E7F4EE k-tx-005A36">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{c.label}</span>
                  <span className="block text-sm font-semibold k-tx-005A36">{c.detail}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">{c.note}</span>
                </span>
              </>
            );
            return c.action ? (
              <a key={c.id} href={c.action} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">{inner}</a>
            ) : (
              <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">{inner}</div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle hint="Tap the bell to be reminded">Events near you</SectionTitle>
        <div className="space-y-2.5">
          {EVENTS.map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-FBF5E7 k-tx-6B5307">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-600">{e.date} · {e.venue}</p>
                <div className="mt-2 flex gap-1.5">
                  <Pill tone="slate">{e.type}</Pill>
                  <Pill tone="slate">{e.province}</Pill>
                </div>
              </div>
              <button onClick={() => notify(e)} aria-label={`Remind me about ${e.title}`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Common questions</SectionTitle>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {FAQS.map((f, i) => (
            <div key={i}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="flex w-full items-center gap-2 p-3 text-left">
                <CircleHelp className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="flex-1 text-sm font-medium text-slate-900">{f.q}</span>
                <ChevronRight className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && (
                <p className="px-3 pb-3 text-xs leading-relaxed text-slate-600">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Detail screens ---------------------------------------- */
function CareerDetail({ id, onBack, fav, toggleFav, go }) {
  const o = occById[id];
  const quals = o.quals.map((q) => qualById[q]).filter(Boolean);
  return (
    <Screen onBack={onBack} title={o.title} subtitle={o.summary}
      action={<FavouriteButton on={fav.includes(o.id)} onToggle={() => toggleFav(o.id)} label={o.title} />}>
      <div className="flex flex-wrap gap-1.5">
        <Pill style={{ background: FIELD[o.field].color, color: o.field === "business" ? KHETHA.ink : "#fff" }}>
          {FIELD[o.field].label}
        </Pill>
        <Pill tone={o.demand === "Scarce skill" ? "red" : "slate"}>{o.demand}</Pill>
        <Pill tone="slate">OFO {o.ofo}</Pill>
        <Pill tone="slate">{o.riasec.map((r) => RIASEC_TYPES[r].label).join(" / ")}</Pill>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">What you would actually do</p>
        <ul className="mt-2 space-y-1.5">
          {o.tasks.map((task) => (
            <li key={task} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{task}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Typical earnings</p>
        <p className="mt-1 text-sm k-tx-005A36">{o.salary}</p>
        <p className="mt-1 text-[11px] text-slate-600">Entry level to experienced. Varies by employer and province.</p>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">School subjects that lead here</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {o.subjects.map((s) => <Pill key={s} tone="blue">{SUBJECT_LABELS[s]}</Pill>)}
        </div>
      </div>

      <SectionTitle hint="Tap to open">How to qualify</SectionTitle>
      <div className="space-y-2.5">
        {quals.map((q) => (
          <button key={q.id} onClick={() => go(`qual:${q.id}`)}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left">
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-900">{q.title}</span>
              <span className="block text-[11px] text-slate-600">
                {providerById[q.providerId].name} · NQF {q.nqf} · APS {q.minAPS}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
        ))}
      </div>
    </Screen>
  );
}

function QualDetail({ id, onBack, ctx, fav, toggleFav }) {
  const q = qualById[id];
  const p = providerById[q.providerId];
  const { eligible, unmet } = eligibility(q, ctx);
  const leadsTo = OCCUPATIONS.filter((o) => o.quals.includes(q.id));
  return (
    <Screen onBack={onBack} title={q.title} subtitle={p.name}
      action={<FavouriteButton on={fav.includes(q.id)} onToggle={() => toggleFav(q.id)} label={q.title} />}>
      <div className={`rounded-2xl p-4 text-white`} style={{ background: eligible ? KHETHA.greenDeep : "#0F172A" }}>
        <p className="text-xs opacity-80">{eligible ? "You qualify" : "Not yet"}</p>
        <p className="mt-1 text-sm leading-relaxed">
          {eligible
            ? `Your marks meet every requirement. Applications close ${q.deadline}.`
            : `Still needed: ${unmet.join(" · ")}`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[{ l: "Minimum APS", v: q.minAPS }, { l: "NQF level", v: q.nqf }, { l: "Duration", v: q.duration }].map((s) => (
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
            <p className="text-sm font-bold text-slate-900">{s.v}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Subject requirements</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {q.pureMathsOnly && <Pill tone="gold">Pure Mathematics only</Pill>}
          {Object.entries(q.requires).map(([k, v]) => (
            <Pill key={k} tone={ctx.marks[k] >= v ? "green" : "red"}>
              {SUBJECT_LABELS[k]} ≥ {v}%
            </Pill>
          ))}
          {Object.keys(q.requires).length === 0 && <Pill tone="slate">No specific subject requirements</Pill>}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Funding and dates</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {q.nsfas ? <Pill tone="green" icon={ShieldCheck}>NSFAS accredited</Pill> : <Pill tone="red">Self-funded</Pill>}
          <Pill tone="navy" icon={CalendarClock}>Closes {q.deadline}</Pill>
        </div>
      </div>

      {leadsTo.length > 0 && (
        <>
          <SectionTitle>Careers this leads to</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {leadsTo.map((o) => <Pill key={o.id} tone="blue">{o.title}</Pill>)}
          </div>
        </>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">{p.name}</p>
        <p className="mt-0.5 text-[11px] text-slate-600">{p.city}, {p.province} · {PROVIDER_TYPES[p.type]}</p>
        <a href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
          <Phone className="h-3.5 w-3.5" />{p.phone}
        </a>
      </div>
    </Screen>
  );
}

/* ==================================================================
   Screen 4: Verified Mentor, Tutor and Professional Connect Network
   ================================================================== */

/* Safety guardrail: contact details are redacted before a message is
   ever stored or delivered. Runs on send, not on display, so the raw
   string never reaches the other learner's device. */


function VerificationBadge({ mentor }) {
  const partner = mentor.partner ? partnerById[mentor.partner] : null;
  if (partner) {
    return (
      <Pill tone="green" icon={ShieldCheck}>
        Verified via {partner.name.length > 28 ? partner.name.slice(0, 26) + "…" : partner.name}
      </Pill>
    );
  }
  if (mentor.employerVerified) {
    return <Pill tone="blue" icon={ShieldCheck}>Employer-verified professional</Pill>;
  }
  return <Pill tone="slate">Unverified</Pill>;
}

function RoadmapCallout() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border k-bd-D4AF37 k-bg-FBF5E7 p-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 k-tx-6B5307" />
      <p className="text-[11px] leading-relaxed k-tx-6B5307">
        <span className="font-semibold">How verification works today.</span> Every mentor in this MVP is vouched for
        by a partner NGO or a student society, because those organisations already run their own vetting. The roadmap
        adds SACE registration numbers for teachers, academic transcript checks with institutions, and corporate email
        domain verification for industry professionals.
      </p>
    </div>
  );
}

function MentorCard({ m, onRequest, onOpen }) {
  return (
    <article className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
      style={{ borderLeftColor: FIELD[m.field].color }}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ background: FIELD[m.field].color }}>
          {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{m.name}</h3>
          <p className="mt-0.5 text-[11px] text-slate-600">{m.studying}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
            <MapPin className="h-3 w-3" />{m.area}, {m.province}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="flex items-center gap-1 text-xs font-bold text-slate-900">
            <Star className="h-3.5 w-3.5 k-tx-D4AF37 fill-current" />{m.rating}
          </p>
          <p className="text-[10px] text-slate-600">{m.sessions} sessions</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill tone="slate">{MENTOR_ROLES[m.role].label}</Pill>
        <VerificationBadge mentor={m} />
        {m.subjects.map((s) => <Pill key={s} tone="blue">{s}</Pill>)}
        <Pill tone="slate" icon={CalendarClock}>{m.availability}</Pill>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">{m.bio}</p>

      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
        <button onClick={() => onRequest(m)}
          className="flex-1 rounded-lg k-bg-005A36 py-2 text-[11px] font-semibold text-white">
          Send a help request
        </button>
        <button onClick={() => onOpen(m)}
          className="flex-1 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
          Message
        </button>
      </div>
    </article>
  );
}

/* ---- Structured help-request letter ------------------------------- */
function RequestLetterModal({ mentor, learner, aps, onClose, onSend }) {
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState(mentor.subjects[0]);
  const [need, setNeed] = useState("");
  const [sent, setSent] = useState(false);

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
          <p className="mt-3 text-sm font-semibold text-slate-900">Your letter is with {mentor.name}</p>
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
    <ModalShell onClose={onClose} title={`Help request to ${mentor.name}`}>
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

      <button onClick={() => { onSend({ mentor, goal, subject, need }); setSent(true); }} disabled={!valid}
        className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        Send request letter
      </button>
      {!valid && (
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Add a goal and a sentence or two on what you are stuck on.
        </p>
      )}
    </ModalShell>
  );
}

/* ---- Mentor-side dashboard ---------------------------------------- */
function MentorInbox({ requests, onAct }) {
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

/* ---- Guarded messaging -------------------------------------------- */
function MentorChat({ mentor, onBack }) {
  const [messages, setMessages] = useState([
    { from: "them", text: `Hi! I saw your request. Which topic in ${mentor.subjects[0]} is giving you the most trouble?` },
  ]);
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState(null);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages]);

  const send = () => {
    const raw = draft.trim();
    if (!raw) return;
    const { text, found } = redact(raw);
    setMessages((m) => [...m, { from: "me", text, redacted: found }]);
    setWarning(found.length ? found : null);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "them", text: "Sharp. Send me the question you got stuck on and we'll work it through in our session." }]);
    }, 700);
  };

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="shrink-0 border-b k-bd-00432A k-bg-005A36 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back to mentors"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-full k-bg-D4AF37 text-sm font-bold text-slate-900">
            {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{mentor.name}</p>
            <p className="truncate text-[11px] k-tx-BFE5D4">{MENTOR_ROLES[mentor.role].label}</p>
          </div>
        </div>
      </div>

      <p className="flex shrink-0 items-start gap-2 border-b border-slate-200 bg-white px-4 py-2.5 text-[11px] leading-relaxed text-slate-600">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 k-tx-005A36" />
        External phone numbers, social handles and personal links are redacted for learner protection. Keep tutoring
        inside Khetha so it stays logged and safe.
      </p>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
              m.from === "me" ? "rounded-br-md k-bg-005A36 text-white" : "rounded-bl-md bg-white text-slate-800"
            }`}>
              {m.text}
              {m.redacted?.length > 0 && (
                <span className="mt-1.5 block text-[10px] italic opacity-80">
                  {m.redacted.join(" and ")} removed automatically
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {warning && (
        <p className="mx-3 mb-2 flex items-start gap-2 rounded-xl k-bg-FBEAE8 p-2.5 text-[11px] leading-relaxed k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          We removed a {warning.join(" and ")} from that message. Sharing contact details moves the conversation
          somewhere we cannot protect you.
        </p>
      )}

      <div className="shrink-0 border-t border-slate-200 bg-white p-2.5">
        <div className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message your mentor"
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          <button onClick={send} aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full k-bg-005A36 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Hub ----------------------------------------------------------- */
function MentorHub({ learner, aps, requests, setRequests }) {
  const [view, setView] = useState("find");
  const [role, setRole] = useState("all");
  const [province, setProvince] = useState("All");
  const [q, setQ] = useState("");
  const [requesting, setRequesting] = useState(null);
  const [chatting, setChatting] = useState(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return MENTORS
      .filter((m) => (role === "all" ? true : m.role === role))
      .filter((m) => (province === "All" ? true : m.province === province))
      .filter((m) => !s || m.name.toLowerCase().includes(s) ||
        m.subjects.join(" ").toLowerCase().includes(s) || m.studying.toLowerCase().includes(s));
  }, [role, province, q]);

  if (chatting) return <MentorChat mentor={chatting} onBack={() => setChatting(null)} />;

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="grid grid-cols-2 gap-2">
        {[{ key: "find", label: "Find a mentor" }, { key: "inbox", label: `Mentor inbox (${requests.filter((r) => r.status === "pending").length})` }]
          .map((x) => (
            <button key={x.key} onClick={() => setView(x.key)}
              className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
                view === x.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}>{x.label}</button>
          ))}
      </div>

      <RoadmapCallout />

      {view === "inbox" ? (
        <>
          <SectionTitle hint="What a mentor sees">Incoming request letters</SectionTitle>
          <MentorInbox requests={requests}
            onAct={(id, status) => setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))} />
        </>
      ) : (
        <>
          <SearchBar value={q} onChange={setQ} placeholder="Search a name, subject or institution" />
          <Chips value={role} onChange={setRole}
            options={[{ key: "all", label: "All roles" },
              ...Object.entries(MENTOR_ROLES).map(([k, v]) => ({ key: k, label: v.label }))]} />
          <Chips value={province} onChange={setProvince}
            options={PROVINCES.map((p) => ({ key: p, label: p }))} />
          <p className="text-xs text-slate-600">{results.length} verified mentors</p>
          <div className="space-y-3">
            {results.map((m) => (
              <MentorCard key={m.id} m={m} onRequest={setRequesting} onOpen={setChatting} />
            ))}
            {results.length === 0 && (
              <EmptyState icon={Users} title="No mentors match"
                body="Widen the role or province filter. The network is growing as partner organisations onboard." />
            )}
          </div>
        </>
      )}

      {requesting && (
        <RequestLetterModal mentor={requesting} learner={learner} aps={aps}
          onClose={() => setRequesting(null)}
          onSend={({ mentor, goal, subject, need }) =>
            setRequests((rs) => [{
              id: `r-${Date.now()}`, from: learner.name, grade: learner.grade, mentorId: mentor.id,
              subject, goal, aps: aps || "—",
              marks: learner.subjects
                ? learner.subjects.filter((s) => !s.excluded).slice(0, 3).map((s) => `${s.label} ${s.pct}%`).join(", ")
                : Object.entries(learner.gr9Marks || {}).slice(0, 3).map(([k, v]) => `${SUBJECT_LABELS[k] || k} ${v}%`).join(", "),
              need, status: "pending", sent: "just now",
            }, ...rs])} />
      )}
    </div>
  );
}

/* ==================================================================
   Mentor / professional workspace
   ================================================================== */

function VerificationBanner({ session, onVerify, application }) {
  const tiers = session.verification?.tiers || [];
  const status = application?.status || (tiers.length ? "pending" : "none");
  const verified = status === "approved";
  return (
    <div className={`rounded-2xl border p-4 ${verified ? "k-bd-00784A k-bg-E7F4EE" : "k-bd-D4AF37 k-bg-FBF5E7"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${verified ? "k-bg-005A36" : "k-bg-D4AF37"}`}>
          {verified ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5 text-slate-900" />}
        </span>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${verified ? "k-tx-005A36" : "k-tx-6B5307"}`}>
            {status === "approved" ? "Approved — learners can reach you"
              : status === "rejected" ? "Application not approved"
              : status === "more-info" ? "More information needed"
              : status === "pending" ? "Submitted — awaiting DHET review"
              : "Verification pending"}
          </p>
          <p className={`mt-1 text-xs leading-relaxed ${verified ? "k-tx-005A36" : "k-tx-6B5307"}`}>
            {status === "approved"
              ? "Your profile shows these badges to every learner browsing the mentor network."
              : status === "rejected"
                ? (application?.note || "The verification team could not confirm the credentials supplied. You may appeal with further documents.")
              : status === "more-info"
                ? (application?.note || "The verification team needs more from you before they can decide. Check your email for the detail.")
              : status === "pending"
                ? "A person on the DHET verification team reviews every application. Until they approve it, your profile is hidden from the directory and you cannot receive learner requests."
                : "Until at least one check passes, your profile is hidden from the mentor directory and you cannot receive requests."}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5"><TierBadges tiers={tiers} /></div>
          {!verified && status !== "pending" && (
            <button onClick={onVerify}
              className="mt-3 rounded-lg k-bg-005A36 px-3 py-1.5 text-[11px] font-semibold text-white">
              Complete verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Recommendation letter ---------------------------------------- */
function RecommendationLetterModal({ request, session, onClose, onIssue }) {
  const [strength, setStrength] = useState("strong");
  const [body, setBody] = useState(
    `I have worked with ${request.from} on ${request.subject} and can speak to both the work and the circumstances behind the marks. `
  );
  const [issued, setIssued] = useState(false);

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
          <p className="mt-3 text-sm font-semibold text-slate-900">Sent to {request.from}</p>
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
    <ModalShell title={`Recommendation letter for ${request.from}`} onClose={onClose} wide>
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
            <p>Reference: KHE-{request.id.toUpperCase()}-{String(Date.now()).slice(-5)}</p>
            <p className="pt-1">To whom it may concern,</p>
            <p>{body}</p>
            <p>
              {request.from} is in Grade {request.grade}, currently at {request.marks}, with an APS of {request.aps}.
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

      <button onClick={() => { onIssue(request.id); setIssued(true); }} disabled={body.trim().length < 40}
        className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        Issue letter
      </button>
    </ModalShell>
  );
}

function MentorWorkspace({ session, requests, setRequests, onVerify, application }) {
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

/* ==================================================================
   Admin approval queue
   Nothing a mentor submits reaches a learner until a human approves it.
   The flag engine below does not decide — it tells the reviewer where
   to look, because the patterns it catches are the ones that recur in
   impersonation attempts.
   ================================================================== */

/* ---- South African ID number validation --------------------------- */



/* ---- The flag engine ---------------------------------------------- */



/* ---- Seeded applications ------------------------------------------ */

/* ---- Reviewer guidance -------------------------------------------- */

function VettingGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border k-bd-D4AF37 k-bg-FBF5E7 p-4">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="flex w-full items-start gap-3 text-left">
        <Info className="mt-0.5 h-5 w-5 shrink-0 k-tx-6B5307" />
        <span className="flex-1">
          <span className="block text-sm font-semibold k-tx-6B5307">What to watch out for</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed k-tx-6B5307">
            Eight patterns that recur when someone is not who they say they are. These accounts contact minors, so
            the bar is corroboration, not plausibility.
          </span>
        </span>
        <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 k-tx-6B5307 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-2.5 border-t k-bd-E4CE8A pt-3">
          {VETTING_GUIDE.map((g) => (
            <div key={g.title}>
              <p className="text-[11px] font-semibold k-tx-6B5307">{g.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700">{g.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Application detail ------------------------------------------- */
function ApplicationDetail({ app, onBack, onDecide }) {
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

/* ---- Queue --------------------------------------------------------- */
function AdminApprovals({ applications, setApplications }) {
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("pending");

  const decide = (id, status, note) => {
    setApplications((as) => as.map((a) => a.id === id ? {
      ...a, status, note,
      decidedBy: "You (DHET verification team)",
      decidedOn: new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }),
    } : a));
    setOpenId(null);
  };

  const open = applications.find((a) => a.id === openId);
  if (open) return <ApplicationDetail app={open} onBack={() => setOpenId(null)} onDecide={decide} />;

  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    "more-info": applications.filter((a) => a.status === "more-info").length,
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

      <div className="grid grid-cols-4 gap-2">
        {[["pending", "Pending"], ["more-info", "More info"], ["approved", "Approved"], ["rejected", "Rejected"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`rounded-lg px-1.5 py-2 text-[10px] font-semibold transition-colors ${
              filter === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}>{l} ({counts[k]})</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={ClipboardList} title={`No ${filter.replace("-", " ")} applications`}
          body="New mentor and professional sign-ups land here the moment they submit verification." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {shown.map((a) => {
            const { flags, verdict } = riskFlags(a);
            const v = VERDICT_STYLE[verdict];
            const high = flags.filter((f) => f.level === "high").length;
            return (
              <button key={a.id} onClick={() => setOpenId(a.id)}
                className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4 text-left"
                style={{ borderLeftColor: v.color }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{a.fullName}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      {ROLES[a.role].label} · {a.institution || "no employer given"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">Submitted {a.submitted}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Pill tone={v.tone}>{v.label}</Pill>
                  {high > 0 && <Pill tone="red" icon={AlertTriangle}>{high} high</Pill>}
                  {a.partnerName && <Pill tone="green" icon={ShieldCheck}>{a.partnerName.split(" ")[0]} vetted</Pill>}
                  {!a.idDoc && <Pill tone="slate">No ID doc</Pill>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-slate-600">
        Decisions are logged against your administrator account with the note you write. Applicants are told the
        outcome and, where more information is needed, exactly what is missing.
      </p>
    </div>
  );
}

/* ==================================================================
   Admin: platform data analytics and telemetry
   Figures below are seeded telemetry for the demonstration. In
   production every one is a query against the analytics warehouse.
   ================================================================== */



function StatCard({ label, value, sub, color = THEME.primary, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-tight text-slate-600">{label}</p>
        {Icon && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: color }}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] leading-tight text-slate-600">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max, display, color = THEME.primary }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[11px] text-slate-700">{label}</span>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-900">{display}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function Donut({ segments, centreLabel, centreValue }) {
  const total = segments.reduce((a, s) => a + s.n, 0);
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" role="img" aria-label={`${centreLabel}: ${centreValue}`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#E2E8F0" strokeWidth="18" />
        {segments.map((s) => {
          const len = (s.n / total) * C;
          const el = (
            <circle key={s.method || s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="18"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
              transform="rotate(-90 70 70)" />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 20, fontWeight: 700 }}>
          {centreValue}
        </text>
        <text x="70" y="82" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 9 }}>
          {centreLabel}
        </text>
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {segments.map((s) => (
          <div key={s.method || s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1 truncate text-[11px] text-slate-700">{s.method || s.label}</span>
            <span className="text-[11px] font-semibold tabular-nums text-slate-900">
              {Math.round((s.n / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, hint, children, wide }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
        {hint && <span className="shrink-0 text-[10px] text-slate-600">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function AdminAnalytics({ liveAps }) {
  const t = TELEMETRY;
  const maxProv = Math.max(...t.provinces.map((p) => p.users));
  const maxViews = Math.max(...t.topCareers.map((c) => c.views));
  const [careerSort, setCareerSort] = useState("views");

  const careers = [...t.topCareers].sort((a, b) =>
    careerSort === "views" ? b.views - a.views : b.salary - a.salary
  );
  const gradeTotal = t.gradeSplit.trackA + t.gradeSplit.trackB;
  const maxBand = Math.max(...t.apsDistribution.map((b) => b.n));

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">Platform telemetry · last 30 days</p>
        <p className="mt-0.5 text-lg font-semibold">Khetha NCAP mobile</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Registered</p>
            <p className="text-lg font-bold tabular-nums">{fmt(t.users)}</p>
          </div>
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Active this week</p>
            <p className="text-lg font-bold tabular-nums">{fmt(t.activeThisWeek)}</p>
          </div>
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Mean APS</p>
            <p className="text-lg font-bold tabular-nums">{t.avgAPS}</p>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Grade breakdown" hint="Track A vs Track B">
          <Donut centreLabel="Track B" centreValue={pct(t.gradeSplit.trackB / gradeTotal)}
            segments={[
              { label: "Grade 10–12 (Track B)", n: t.gradeSplit.trackB, color: THEME.primary },
              { label: "Grade 9 (Track A)", n: t.gradeSplit.trackA, color: THEME.gold },
            ]} />
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            Grade 9 uptake is the number that matters most. Subject choice is where a pathway is actually decided, and
            it is the group hardest to reach.
          </p>
        </Panel>

        <Panel title="Provincial reach" hint="Registered users">
          <div className="space-y-2">
            {t.provinces.map((p) => (
              <BarRow key={p.name} label={p.name} value={p.users} max={maxProv} display={fmt(p.users)}
                color={p.users > 6000 ? THEME.primary : THEME.blue} />
            ))}
          </div>
        </Panel>
      </div>

      {/* Offline and low data */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="SMS summaries generated" value={fmt(t.smsGenerated)}
          sub="Learners choosing plain text over data" color={THEME.gold} icon={MessageSquare} />
        <StatCard label="Offline mode activations" value={fmt(t.offlineToggles)}
          sub={`${pct(t.offlineShare)} of sessions use cached content`} color={THEME.blue} icon={WifiOff} />
        <StatCard label="Scarce skills alignment" value={pct(t.scarceSkillsAlignment)}
          sub="Queries matching the DHET critical skills list" color={THEME.primary} icon={Target} />
      </div>

      {/* Reality check */}
      <Panel title="Aspiration versus eligibility" hint="The reality-check metric" wide>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-3xl font-bold tabular-nums k-tx-B3261E">{pct(t.disconnectRate)}</p>
          <p className="text-xs leading-relaxed text-slate-600">
            of learners bookmarking a high-paying career currently fall short of its APS threshold.
          </p>
        </div>
        <div className="mt-4 space-y-2.5">
          {t.disconnectDetail.map((d) => (
            <BarRow key={d.career} label={`${d.career} · ${fmt(d.bookmarks)} bookmarks`}
              value={d.shortfall} max={1} display={pct(d.shortfall)}
              color={d.shortfall > 0.6 ? THEME.red : d.shortfall > 0.3 ? THEME.gold : THEME.primary} />
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
          Read this as a guidance gap, not a failure of ambition. Electrician sits at 9% because the pathway is honest
          about its entry requirements from Grade 9 onward. Medicine sits at 81% because nobody told those learners in
          time what the gate actually was.
        </p>
      </Panel>

      {/* Gateway bottleneck */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Gateway subject bottleneck" hint="What blocks course unlocks">
          <div className="space-y-2.5">
            <BarRow label="Blocked by Pure Maths requirement" value={t.gateway.blockedByPureMaths} max={1}
              display={pct(t.gateway.blockedByPureMaths)} color={THEME.red} />
            <BarRow label="Capped by Maths Literacy ceiling" value={t.gateway.mathsLitCeiling} max={1}
              display={pct(t.gateway.mathsLitCeiling)} color={THEME.gold} />
            <BarRow label="Meets both gateway routes" value={t.gateway.metBoth} max={1}
              display={pct(t.gateway.metBoth)} color={THEME.primary} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            A single Grade 9 decision accounts for most blocked applications on the platform. This is the strongest
            argument for pushing the Subject Chooser earlier, into Grade 8.
          </p>
        </Panel>

        <Panel title="APS distribution" hint={`Mean ${t.avgAPS} · your session ${liveAps}`}>
          <div className="space-y-2.5">
            {t.apsDistribution.map((b) => (
              <BarRow key={b.band} label={`APS ${b.band}`} value={b.n} max={maxBand} display={fmt(b.n)}
                color={THEME.blue} />
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            Most learners land between 20 and 29 — above TVET and UoT entry, below most degree programmes. That band
            is where course matching earns its keep.
          </p>
        </Panel>
      </div>

      {/* Careers */}
      <Panel title="Most viewed occupations" wide
        hint={
          <span className="flex gap-1.5">
            {[["views", "By views"], ["salary", "By salary"]].map(([k, l]) => (
              <button key={k} onClick={() => setCareerSort(k)}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  careerSort === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}>{l}</button>
            ))}
          </span>
        }>
        <div className="space-y-2.5">
          {careers.map((c) => (
            <BarRow key={c.title}
              label={`${c.title} · R${fmt(c.salary)} starting`}
              value={careerSort === "views" ? c.views : c.salary}
              max={careerSort === "views" ? maxViews : 35000}
              display={careerSort === "views" ? fmt(c.views) : `R${fmt(c.salary)}`}
              color={c.salary >= 25000 ? THEME.navy : c.salary >= 15000 ? THEME.blue : THEME.primary} />
          ))}
        </div>
      </Panel>

      {/* Mentor operations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Mentor operations" hint="Request volume and outcome">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { l: "Requests sent", v: fmt(t.mentorOps.sent) },
              { l: "Accepted", v: fmt(t.mentorOps.accepted) },
              { l: "Acceptance rate", v: pct(t.mentorOps.accepted / t.mentorOps.sent) },
              { l: "Letters issued", v: fmt(t.mentorOps.lettersIssued) },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-bold tabular-nums text-slate-900">{s.v}</p>
                <p className="text-[10px] leading-tight text-slate-600">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <BarRow label="Accepted" value={t.mentorOps.accepted} max={t.mentorOps.sent}
              display={fmt(t.mentorOps.accepted)} color={THEME.primary} />
            <BarRow label="Declined" value={t.mentorOps.declined} max={t.mentorOps.sent}
              display={fmt(t.mentorOps.declined)} color={THEME.red} />
            <BarRow label="Still pending" value={t.mentorOps.pending} max={t.mentorOps.sent}
              display={fmt(t.mentorOps.pending)} color={THEME.gold} />
          </div>
        </Panel>

        <Panel title="How mentors were verified" hint={`${fmt(t.verificationMix.reduce((a, m) => a + m.n, 0))} accounts`}>
          <Donut centreLabel="verified" centreValue={fmt(t.verificationMix.reduce((a, m) => a + m.n, 0))}
            segments={t.verificationMix} />
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            Partner NGO codes carry most of the load, which is the intended design: those organisations already run
            vetting we would otherwise have to build.
          </p>
        </Panel>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-slate-600">
        Figures on this dashboard are seeded telemetry for demonstration. In production each panel is a query against
        the analytics warehouse, aggregated and with no personally identifying data.
      </p>
    </div>
  );
}

/* ==================================================================
   Mzansi AI career advisor
   ================================================================== */




function Advisor({ appLang, profile, offline }) {
  /* Deliberately separate from the app language: a learner may read the
     interface in Setswana but prefer to chat in English, or the reverse. */
  const [lang, setLang] = useState(appLang);
  const [messages, setMessages] = useState([{ from: "bot", text: GREETING[lang] || GREETING.en }]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, typing]);

  const reply = (text) => {
    const lower = text.toLowerCase();
    const hit = SCRIPTS.find((s) => s.match.some((m) => lower.includes(m)));
    const dict = hit ? hit.replies : FALLBACK;
    return dict[lang] || dict.en;
  };

  const send = (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { from: "me", text: clean }]);
    setDraft(""); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: reply(clean) }]);
    }, 650);
  };

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="shrink-0 border-b k-bd-00432A k-bg-005A36 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full k-bg-D4AF37 text-sm font-bold k-tx-0F172A">K</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Khetha advisor</p>
            <p className="text-[11px] k-tx-BFE5D4">
              {offline ? "Offline — answering from the cached guide" : "Online · answers in six languages"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
          {LANGUAGES.map((l) => (
            <button key={l.code}
              onClick={() => { setLang(l.code); setMessages((m) => [...m, { from: "bot", text: GREETING[l.code] }]); }}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                lang === l.code ? "k-bg-D4AF37 text-slate-900" : "k-bg-00432A k-tx-BFE5D4"
              }`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {profile.careerChoice && (
          <p className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
            Advisor can see your {profile.careerChoice.code.join("")} interest code
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
              m.from === "me" ? "rounded-br-md k-bg-005A36 text-white" : "rounded-bl-md bg-white text-slate-800"
            }`}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-xs text-slate-600 shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />Khetha is typing
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="-mb-1 shrink-0 overflow-x-auto px-3 pb-2">
        <div className="flex gap-2">
          {SCRIPTS.map((s) => (
            <button key={s.chip} onClick={() => send(s.chip)}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold k-tx-005A36 ring-1 k-rg-A8DCC5">
              {s.chip}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-2.5">
        <div className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(draft)}
            placeholder="Ask about subjects, APS or funding"
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          <button onClick={() => send(draft)} aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full k-bg-005A36 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   R5 / R6 / R7 / A2: Me — journey, saved, settings, privacy
   ================================================================== */

function MeScreen({ t, session, profile, setProfile, settings, setSettings, notifications, markAllRead, onSignOut, aps, go, packs, togglePack }) {
  const [tab, setTab] = useState("journey");
  const favCareers = profile.favourites.filter((id) => occById[id]);
  const favQuals = profile.favourites.filter((id) => qualById[id]);
  const favProviders = profile.favourites.filter((id) => providerById[id]);

  const tabs = [
    { key: "journey", label: t("myJourney") },
    { key: "saved", label: `${t("saved")} (${profile.favourites.length})` },
    { key: "settings", label: t("settings") },
  ];

  return (
    <div className="p-4 pb-6">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl k-bg-005A36 text-lg font-bold text-white">
          {(session.identity || "K").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">{session.identity}</p>
          <p className="text-xs text-slate-600">Khetha account · signed in with {session.method}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Pill tone="green" icon={ShieldCheck}>2-step on</Pill>
            {session.consent?.ncap && <Pill tone="blue" icon={Plug}>NCAP synced</Pill>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {tabs.map((x) => (
          <button key={x.key} onClick={() => setTab(x.key)}
            className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
              tab === x.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}>{x.label}</button>
        ))}
      </div>

      {/* ---------------- journey ---------------- */}
      {tab === "journey" && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[{ l: "APS", v: aps || "—" },
              { l: "Interest code", v: profile.careerChoice?.code.join("") || "—" },
              { l: "Saved", v: profile.favourites.length }].map((s) => (
              <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                <p className="text-lg font-bold text-slate-900">{s.v}</p>
                <p className="text-[10px] leading-tight text-slate-600">{s.l}</p>
              </div>
            ))}
          </div>

          {profile.subjectResult && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Subject Chooser result</p>
              <p className="mt-1 text-xs text-slate-600">
                Best fit: {profile.subjectResult.results[0].title} ({profile.subjectResult.results[0].readiness}% ready)
              </p>
              <button onClick={() => go("tool:chooser")} className="mt-2 text-xs font-semibold k-tx-005A36">Open</button>
            </div>
          )}
          {profile.jobFit && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Job Fit result</p>
              <p className="mt-1 text-xs text-slate-600">
                Closest match: {profile.jobFit.matches[0].title} at {profile.jobFit.matches[0].fit}%
              </p>
              <button onClick={() => go("tool:fit")} className="mt-2 text-xs font-semibold k-tx-005A36">Open</button>
            </div>
          )}
          {!profile.subjectResult && !profile.careerChoice && !profile.jobFit && (
            <EmptyState icon={ClipboardList} title="Nothing saved yet"
              body="Complete a tool and the result is kept here, so the advisor and the directories can use it."
              cta="Open the tools" onCta={() => go("tab:tools")} />
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              {notifications.some((n) => !n.read) && (
                <button onClick={markAllRead} className="text-xs font-semibold k-tx-005A36">Mark all read</button>
              )}
            </div>
            <div className="space-y-2">
              {notifications.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-600">
                  Save a qualification or an event and reminders appear here.
                </p>
              )}
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 rounded-xl border p-3 ${n.read ? "border-slate-200 bg-white" : "k-bd-E4CE8A k-bg-FBF5E7"}`}>
                  <Bell className={`mt-0.5 h-4 w-4 shrink-0 ${n.read ? "text-slate-500" : "k-tx-6B5307"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-600">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- saved ---------------- */}
      {tab === "saved" && (
        <div className="mt-4 space-y-4">
          {profile.favourites.length === 0 && (
            <EmptyState icon={Heart} title="No saved items"
              body="Tap the heart on any career, qualification or provider and it lands here — available offline."
              cta="Explore" onCta={() => go("tab:explore")} />
          )}
          {favCareers.length > 0 && (
            <div>
              <SectionTitle>Careers</SectionTitle>
              <div className="space-y-2">
                {favCareers.map((id) => (
                  <button key={id} onClick={() => go(`career:${id}`)}
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left">
                    <span className="flex-1 text-sm font-medium text-slate-900">{occById[id].title}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {favQuals.length > 0 && (
            <div>
              <SectionTitle hint="Deadlines tracked">Qualifications</SectionTitle>
              <div className="space-y-2">
                {favQuals.map((id) => (
                  <button key={id} onClick={() => go(`qual:${id}`)}
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left">
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-slate-900">{qualById[id].title}</span>
                      <span className="block text-[11px] text-slate-600">Closes {qualById[id].deadline}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {favProviders.length > 0 && (
            <div>
              <SectionTitle>Providers</SectionTitle>
              <div className="space-y-2">
                {favProviders.map((id) => (
                  <div key={id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-sm font-medium text-slate-900">{providerById[id].name}</p>
                    <p className="text-[11px] text-slate-600">{providerById[id].city} · {providerById[id].phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- settings ---------------- */}
      {tab === "settings" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Languages className="h-4 w-4" />{t("language")}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              Changes the whole app. The advisor chat has its own language setting, so you can read the app in one
              language and chat in another.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => setSettings((s) => ({ ...s, lang: l.code }))}
                  className={`rounded-lg px-2 py-2 text-[11px] font-medium transition-colors ${
                    settings.lang === l.code ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700"
                  }`}>{l.native}</button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Accessibility className="h-4 w-4" />{t("accessibility")}
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium text-slate-700"><Type className="h-3.5 w-3.5" />{t("textSize")}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[{ v: 1, l: t("standard") }, { v: 1.15, l: t("large") }, { v: 1.3, l: t("largest") }].map((o) => (
                    <button key={o.v} onClick={() => setSettings((s) => ({ ...s, textScale: o.v }))}
                      className={`rounded-lg px-2 py-2 text-[11px] font-medium transition-colors ${
                        settings.textScale === o.v ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700"
                      }`}>{o.l}</button>
                  ))}
                </div>
              </div>
              {[
                { key: "highContrast", icon: Contrast, label: t("highContrast"), note: "Black on white, heavier borders, no tinted backgrounds." },
                { key: "reduceMotion", icon: RefreshCw, label: t("reduceMotion"), note: "Turns off spinners and transitions." },
                { key: "simpleLanguage", icon: Info, label: t("plainLanguage"), note: "Shorter sentences and fewer technical terms." },
              ].map((o) => {
                const Icon = o.icon;
                return (
                  <button key={o.key} onClick={() => setSettings((s) => ({ ...s, [o.key]: !s[o.key] }))}
                    className="flex w-full items-start gap-3 text-left">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                    <span className="flex-1">
                      <span className="block text-xs font-medium text-slate-900">{o.label}</span>
                      <span className="block text-[11px] text-slate-600">{o.note}</span>
                    </span>
                    <span className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${settings[o.key] ? "k-bg-005A36" : "bg-slate-300"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${settings[o.key] ? "left-[18px]" : "left-0.5"}`} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <WifiOff className="h-4 w-4" />{t("dataAndOffline")}
            </p>
            <button onClick={() => setSettings((s) => ({ ...s, offline: !s.offline }))}
              className="mt-3 flex w-full items-start gap-3 text-left">
              <span className="flex-1">
                <span className="block text-xs font-medium text-slate-900">{t("lowDataMode")}</span>
                <span className="block text-[11px] text-slate-600">
                  Uses only downloaded content. Roughly 90% less data on a typical session.
                </span>
              </span>
              <span className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${settings.offline ? "k-bg-005A36" : "bg-slate-300"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${settings.offline ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </button>
            <p className="mt-4 text-xs font-medium text-slate-700">Downloaded for offline use</p>
            <div className="mt-2 space-y-2">
              {packs.map((p) => (
                <div key={p.key} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
                  <span className="flex-1">
                    <span className="block text-xs font-medium text-slate-900">{p.label}</span>
                    <span className="block text-[10px] text-slate-600">{p.size}</span>
                  </span>
                  <button onClick={() => togglePack(p.key)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      p.on ? "k-bg-E7F4EE k-tx-005A36 ring-1 k-rg-A8DCC5" : "bg-slate-900 text-white"
                    }`}>
                    {p.on ? "Downloaded" : "Download"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BellRing className="h-4 w-4" />{t("notifications")}
            </p>
            {[
              { key: "notifyDeadlines", label: "Application deadlines", note: "Two weeks and three days before each closing date." },
              { key: "notifyEvents", label: "Events in my province", note: "Career expos, open days and workshops." },
              { key: "notifyNsfas", label: "NSFAS and funding dates", note: "Opening and closing of the funding window." },
            ].map((o) => (
              <button key={o.key} onClick={() => setSettings((s) => ({ ...s, [o.key]: !s[o.key] }))}
                className="mt-3 flex w-full items-start gap-3 text-left">
                <span className="flex-1">
                  <span className="block text-xs font-medium text-slate-900">{o.label}</span>
                  <span className="block text-[11px] text-slate-600">{o.note}</span>
                </span>
                <span className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${settings[o.key] ? "k-bg-005A36" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${settings[o.key] ? "left-[18px]" : "left-0.5"}`} />
                </span>
              </button>
            ))}
          </div>

          {/* A1 / A2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Plug className="h-4 w-4" />NCAP connection
            </p>
            <div className="mt-3 space-y-2 text-[11px]">
              {[
                ["Status", session.consent?.ncap ? "Connected" : "Not connected"],
                ["Endpoint", "api.careerhelp.org.za/v1"],
                ["Last sync", "Today, 06:14"],
                ["Conflicts", "None — NCAP record is the source of truth"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-slate-600">{k}</span>
                  <span className="font-medium text-slate-900">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4" />{t("privacyConsent")}
            </p>
            <div className="mt-3 space-y-2.5">
              {CONSENT_ITEMS.map((c) => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="flex-1 text-xs text-slate-700">{c.label}</span>
                  <Pill tone={session.consent?.[c.key] ? "green" : "slate"}>
                    {session.consent?.[c.key] ? "Allowed" : "Off"}
                  </Pill>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
                <FileDown className="h-3.5 w-3.5" />{t("exportData")}
              </button>
              <button
                onClick={() => setProfile((p) => ({ ...p, favourites: [], careerChoice: null, jobFit: null, subjectResult: null }))}
                className="flex items-center justify-center gap-1.5 rounded-lg k-bg-FBEAE8 py-2 text-[11px] font-semibold k-tx-9B1C14">
                <Trash2 className="h-3.5 w-3.5" />{t("deleteResults")}
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
              Data is encrypted in transit and at rest and stored in South Africa. Deleting your results is immediate
              and cannot be undone.
            </p>
          </div>

          <button onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold k-tx-9B1C14">
            <LogOut className="h-4 w-4" />{t("signOut")}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-slate-600">
            Njinji Career Guidance is a demonstration built by Njinjicom against the DHET Khetha NCAP challenge.
            Course, provider and event data is illustrative — confirm with the institution before applying.
          </p>
        </div>
      )}
    </div>
  );
}


/* ==================================================================
   Persistence: localStorage with a graceful in-memory fallback.
   Some sandboxed preview frames block storage; the app must still run.
   ================================================================== */
const STORE_KEY = "njinji.career.v1";
const memoryStore = {};

const storage = {
  available: (() => {
    try {
      const k = "__njinji_probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })(),
  read() {
    try {
      const raw = this.available ? window.localStorage.getItem(STORE_KEY) : memoryStore[STORE_KEY];
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  write(value) {
    const raw = JSON.stringify(value);
    try {
      if (this.available) window.localStorage.setItem(STORE_KEY, raw);
      else memoryStore[STORE_KEY] = raw;
      return true;
    } catch {
      memoryStore[STORE_KEY] = raw;
      return false;
    }
  },
  clear() {
    try {
      if (this.available) window.localStorage.removeItem(STORE_KEY);
    } catch { /* ignore */ }
    delete memoryStore[STORE_KEY];
  },
};

/* ==================================================================
   Root — responsive across mobile, tablet and desktop
   ================================================================== */

export default function NjinjiCareerGuidance() {
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [route, setRoute] = useState(null);
  const [exploreTab, setExploreTab] = useState("careers");
  const [fieldFilter, setFieldFilter] = useState("all");

  /* Pitch Mode: false = Sipho (Grade 9), true = Thandi (Grade 12) */
  const [pitchMode, setPitchMode] = useState(true);
  const learner = pitchMode ? DEMO_PROFILES.thandi : DEMO_PROFILES.sipho;

  const [settings, setSettings] = useState({
    lang: "en", textScale: 1, highContrast: false, reduceMotion: false,
    simpleLanguage: false, offline: false, saveOffline: false,
    notifyDeadlines: true, notifyEvents: true, notifyNsfas: true,
  });
  const t = useT(settings.lang);

  const [profile, setProfile] = useState({
    favourites: [], careerChoice: null, jobFit: null, subjectResult: null,
  });
  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [applications, setApplications] = useState(SEED_APPLICATIONS);
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "NSFAS applications close soon",
      body: "The funding window for the 2027 intake closes on 31 January.", read: false, target: "advice" },
  ]);
  const [packs, setPacks] = useState([
    { key: "careers", label: "Careers directory", size: "1.2 MB", on: true },
    { key: "quals", label: "Qualifications and providers", size: "2.4 MB", on: true },
    { key: "tools", label: "Questionnaires and calculators", size: "0.3 MB", on: true },
    { key: "advice", label: "Advice guide and FAQs", size: "0.8 MB", on: false },
  ]);
  const togglePack = (key) => setPacks((ps) => ps.map((p) => (p.key === key ? { ...p, on: !p.on } : p)));

  const [viewport, setViewport] = useState("auto");
  const [wide, setWide] = useState(false);
  const [online, setOnline] = useState(true);
  const [savedAt, setSavedAt] = useState(null);
  const [installEvent, setInstallEvent] = useState(null);
  const [showNextBar, setShowNextBar] = useState(true);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);

  /* APS subjects follow the selected demo profile */
  const [subjects, setSubjects] = useState(DEMO_PROFILES.thandi.subjects);
  const [mathsIsPure, setMathsIsPure] = useState(true);
  useEffect(() => {
    if (pitchMode) setSubjects(DEMO_PROFILES.thandi.subjects);
  }, [pitchMode]);

  /* ---- responsive detection, connectivity and install prompt ------- */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener ? mq.addEventListener("change", apply) : mq.addListener(apply);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", apply) : mq.removeListener(apply));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    setOnline(typeof navigator !== "undefined" ? navigator.onLine !== false : true);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const grab = (e) => { e.preventDefault(); setInstallEvent(e); };
    window.addEventListener("beforeinstallprompt", grab);
    return () => window.removeEventListener("beforeinstallprompt", grab);
  }, []);

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    try { await installEvent.userChoice; } catch { /* dismissed */ }
    setInstallEvent(null);
  };

  /* ---- rehydrate once on mount (Offline caching strategy) ---------- */
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const apply = (saved) => {
      if (!saved) return;
      if (saved.profile) setProfile(saved.profile);
      if (saved.settings) setSettings((s) => ({ ...s, ...saved.settings }));
      if (saved.subjects) setSubjects(saved.subjects);
      if (typeof saved.mathsIsPure === "boolean") setMathsIsPure(saved.mathsIsPure);
      if (typeof saved.pitchMode === "boolean") setPitchMode(saved.pitchMode);
      if (saved.savedAt) setSavedAt(saved.savedAt);
    };
    /* IndexedDB survives more aggressive storage pressure than localStorage,
       so it is tried first; the synchronous store is the fallback. */
    idbGet(STORE_KEY).then((v) => apply(v || storage.read())).catch(() => apply(storage.read()));
  }, []);

  /* ---- persist whenever "Save for offline viewing" is on ----------- */
  const persist = useCallback(() => {
    const payload = { profile, settings, subjects, mathsIsPure, pitchMode, savedAt: Date.now() };
    storage.write(payload);
    idbSet(STORE_KEY, payload).catch(() => { /* localStorage already has it */ });
    setSavedAt(payload.savedAt);
    return payload.savedAt;
  }, [profile, settings, subjects, mathsIsPure, pitchMode]);

  useEffect(() => {
    if (!settings.saveOffline) return;
    persist();
  }, [settings.saveOffline, profile, subjects, mathsIsPure, pitchMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const aps = useMemo(
    () => subjects.filter((s) => !s.excluded).map((s) => toLevel(s.pct))
      .sort((a, b) => b - a).slice(0, 6).reduce((a, b) => a + b, 0),
    [subjects]
  );
  const marksMap = useMemo(() => Object.fromEntries(subjects.map((s) => [s.key, s.pct])), [subjects]);
  const ctx = useMemo(() => ({ aps, marks: marksMap, mathsIsPure }), [aps, marksMap, mathsIsPure]);

  const counts = useMemo(() => {
    const out = { university: 0, uot: 0, tvet: 0, cet: 0 };
    QUALIFICATIONS.forEach((q) => {
      if (eligibility(q, ctx).eligible) out[providerById[q.providerId].type] += 1;
    });
    return out;
  }, [ctx]);
  const eligibleCount = counts.university + counts.uot + counts.tvet + counts.cet;
  const journey = useJourney(profile);

  /* Visiting the calculator is what completes the APS step */
  useEffect(() => {
    if (tab === "aps" && !profile.apsVisited) setProfile((p) => ({ ...p, apsVisited: true }));
  }, [tab, profile.apsVisited]);

  const matchedQuals = useMemo(
    () => QUALIFICATIONS.filter((q) => eligibility(q, ctx).eligible).sort((a, b) => b.minAPS - a.minAPS),
    [ctx]
  );
  const gr9Packages = useMemo(
    () => (learner.gr9Marks ? chooseSubjects(learner.gr9Marks, []) : null),
    [learner]
  );

  const toggleFav = (id) => {
    setProfile((p) => {
      const on = p.favourites.includes(id);
      const favourites = on ? p.favourites.filter((x) => x !== id) : [...p.favourites, id];
      if (!on && qualById[id] && settings.notifyDeadlines) {
        setNotifications((n) => [
          { id: `d-${id}`, title: `${qualById[id].title} closes ${qualById[id].deadline}`,
            body: "We'll remind you two weeks and three days before.", read: false, target: `qual:${id}` },
          ...n.filter((x) => x.id !== `d-${id}`),
        ]);
      }
      return { ...p, favourites };
    });
  };

  const remindEvent = (e) =>
    setNotifications((n) => [
      { id: `e-${e.id}`, title: e.title, body: `${e.date} · ${e.venue}`, read: false, target: "advice" },
      ...n.filter((x) => x.id !== `e-${e.id}`),
    ]);

  const unread = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  const go = (target) => {
    if (target === "sms") { setSmsOpen(true); return; }
    if (target === "offline") { setRoute(null); setTab("offline"); return; }
    if (target.startsWith("tab:")) { setRoute(null); setTab(target.slice(4)); return; }
    if (target.startsWith("explore:")) {
      setRoute(null); setTab("courses"); setExploreTab(target.slice(8)); return;
    }
    if (target.startsWith("field:")) {
      setRoute(null); setTab("courses"); setExploreTab("careers"); setFieldFilter(target.slice(6)); return;
    }
    if (target === "advice") { setRoute(null); setTab("courses"); setExploreTab("advice"); return; }
    setRoute(target);
  };

  /* Primary navigation, rendered per role */
  const NAV_BY_ROLE = {
    student: [
      { key: "dashboard", label: t("dashboard"), icon: Home },
      { key: "aps", label: t("apsCalc"), short: t("shortAps"), icon: Calculator },
      { key: "courses", label: t("courses"), icon: Compass },
      { key: "mentors", label: t("mentorHub"), short: t("shortMentor"), icon: Users },
      { key: "advisor", label: t("aiAdvisor"), short: t("aiAdvisor"), icon: MessageCircle },
    ],
    mentor: [
      { key: "workspace", label: t("workspace"), icon: Home },
      { key: "courses", label: t("courses"), icon: Compass },
      { key: "advisor", label: t("aiAdvisor"), short: t("aiAdvisor"), icon: MessageCircle },
      { key: "me", label: t("myProfile"), short: t("myProfile"), icon: User },
    ],
    admin: [
      { key: "approvals", label: t("approvals"), icon: ClipboardList },
      { key: "analytics", label: t("analytics"), icon: TrendingUp },
      { key: "mentors", label: t("mentorNetwork"), short: t("shortMentor"), icon: Users },
      { key: "courses", label: t("courses"), icon: Compass },
      { key: "me", label: t("myProfile"), short: t("myProfile"), icon: User },
    ],
  };
  NAV_BY_ROLE.professional = NAV_BY_ROLE.mentor;

  const NAV = NAV_BY_ROLE[role] || NAV_BY_ROLE.student;
  const SECONDARY = role === "student"
    ? [{ key: "tools", label: t("careerTools"), icon: Wrench },
       { key: "offline", label: t("offlineSaving"), icon: WifiOff },
       { key: "me", label: t("myProfile"), icon: User }]
    : role === "admin"
      ? [{ key: "advisor", label: t("aiAdvisor"), icon: MessageCircle }]
      : [{ key: "mentors", label: t("mentorNetwork"), icon: Users }];
  const isStudent = role === "student";

  const exploreTabs = [
    { key: "careers", label: t("careers") },
    { key: "quals", label: t("whatToStudy") },
    { key: "providers", label: t("whereToStudy") },
    { key: "advice", label: t("advice") },
  ];

  const a11yCss = `
    @keyframes njinji-scan { from { top: 15%; } to { top: 78%; } }
    .k-grad-green{background-image:linear-gradient(to bottom right,#005A36,#00432A)!important}
    .k-fvr-D4AF37:focus-visible{--tw-ring-color:#D4AF37!important;outline-color:#D4AF37}
    .k-fb-00784A:focus{border-color:#00784A!important}
    .k-bg-E7F4EE{background-color:#E7F4EE!important}
    .k-bg-FBF5E7{background-color:#FBF5E7!important}
    .k-bg-FBEAE8{background-color:#FBEAE8!important}
    .k-bg-EAEFF7{background-color:#EAEFF7!important}
    .k-bg-005A36{background-color:#005A36!important}
    .k-bg-B3261E{background-color:#B3261E!important}
    .k-bg-1E3A6E{background-color:#1E3A6E!important}
    .k-bg-00784A{background-color:#00784A!important}
    .k-bg-D4AF37{background-color:#D4AF37!important}
    .k-bg-F4E8C9{background-color:#F4E8C9!important}
    .k-bg-00432A{background-color:#00432A!important}
    .k-tx-005A36{color:#005A36!important}
    .k-tx-6B5307{color:#6B5307!important}
    .k-tx-9B1C14{color:#9B1C14!important}
    .k-tx-1E3A6E{color:#1E3A6E!important}
    .k-tx-B3261E{color:#B3261E!important}
    .k-tx-00784A{color:#00784A!important}
    .k-tx-D4AF37{color:#D4AF37!important}
    .k-tx-0F172A{color:#0F172A!important}
    .k-tx-BFE5D4{color:#BFE5D4!important}
    .k-bd-00784A{border-color:#00784A!important}
    .k-bd-005A36{border-color:#005A36!important}
    .k-bd-E5A79F{border-color:#E5A79F!important}
    .k-bd-00432A{border-color:#00432A!important}
    .k-bd-E4CE8A{border-color:#E4CE8A!important}
    .k-rg-A8DCC5{--tw-ring-color:#A8DCC5!important}
    .k-rg-E4CE8A{--tw-ring-color:#E4CE8A!important}
    .k-rg-F2CBC7{--tw-ring-color:#F2CBC7!important}
    .k-rg-C3CFE4{--tw-ring-color:#C3CFE4!important}
    .k-rg-00784A{--tw-ring-color:#00784A!important}
    .k-ac-00784A{accent-color:#00784A!important}
    .k-dis:disabled{background-color:#E2E8F0!important;background-image:none!important;color:#475569!important}
    .k-dis-soft:disabled{opacity:.65}
    .k-dis-tx:disabled{color:#64748B!important}
    .njinji-hc .bg-white, .njinji-hc .bg-slate-50, .njinji-hc .bg-slate-100 { background-color: #FFFFFF !important; }
    .njinji-hc [class*="k-bg-"], .njinji-hc [class*="k-grad-"] { color: #FFFFFF !important; }
    .njinji-hc [class*="text-slate-6"], .njinji-hc [class*="text-slate-5"] { color: #000000 !important; }
    .njinji-hc [class*="border-slate"] { border-color: #000000 !important; }
    .njinji-hc [class*="ring-slate"] { --tw-ring-color: #000000 !important; }
    .njinji-reduce *, .njinji-reduce *::before, .njinji-reduce *::after {
      animation-duration: 0.001ms !important; transition-duration: 0.001ms !important;
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
    }
    .njinji-shell :focus-visible { outline: 3px solid ${THEME.gold}; outline-offset: 2px; }
  `;

  const shellClass = [
    "njinji-shell",
    settings.highContrast ? "njinji-hc" : "",
    settings.reduceMotion ? "njinji-reduce" : "",
  ].join(" ");

  /* ---- shared content, rendered into either layout ----------------- */
  const renderOverlay = () => {
    if (!route) return null;
    if (route === "tool:chooser")
      return <SubjectChooser onBack={() => setRoute(null)} saved={profile.subjectResult}
        onSave={(r) => setProfile((p) => ({ ...p, subjectResult: r }))} />;
    if (route === "tool:choice")
      return <Questionnaire kind="choice" onBack={() => setRoute(null)} saved={profile.careerChoice}
        onSave={(r) => setProfile((p) => ({ ...p, careerChoice: r }))} />;
    if (route === "tool:fit")
      return <Questionnaire kind="fit" onBack={() => setRoute(null)} saved={profile.jobFit}
        onSave={(r) => setProfile((p) => ({ ...p, jobFit: r }))} />;
    if (route.startsWith("career:"))
      return <CareerDetail id={route.slice(7)} onBack={() => setRoute(null)} fav={profile.favourites}
        toggleFav={toggleFav} go={go} />;
    if (route.startsWith("qual:"))
      return <QualDetail id={route.slice(5)} onBack={() => setRoute(null)} ctx={ctx}
        fav={profile.favourites} toggleFav={toggleFav} />;
    return null;
  };

  const body = (
    <>
      {!role && <RoleSelector t={t} lang={settings.lang} setLang={(l) => setSettings((s) => ({ ...s, lang: l }))} onPick={(r) => { setRole(r); setTab(r === "admin" ? "approvals" : r === "student" ? "dashboard" : "workspace"); }} />}

      {role && !session && (
        <AuthScreen role={role} onBack={() => setRole(null)}
          t={t} lang={settings.lang} setLang={(l) => setSettings((s) => ({ ...s, lang: l }))}
          onAuthenticated={(s) => {
            setSession({ ...s, role });
            if (ROLES[role].verifies) setVerifying(true);
          }} />
      )}

      {session && route && renderOverlay()}

      {session && !route && tab === "approvals" && (
        <AdminApprovals applications={applications} setApplications={setApplications} />
      )}

      {session && !route && tab === "analytics" && <AdminAnalytics liveAps={aps} />}

      {session && !route && tab === "workspace" && (
        <MentorWorkspace session={session} requests={requests} setRequests={setRequests}
          application={applications.find((a) => a.id === session.applicationId) || null}
          onVerify={() => setVerifying(true)} />
      )}

      {session && !route && tab === "dashboard" && (
        <Dashboard t={t} learner={learner} profile={profile} go={go} notifications={notifications}
          offline={settings.offline} aps={aps} eligibleCount={eligibleCount}
          onScan={() => setScanOpen(true)} scanned={scanned} onSms={() => setSmsOpen(true)}
          journey={journey} />
      )}

      {session && !route && tab === "aps" && (
        learner.grade === 9 ? (
          <Screen title="APS starts in Grade 10"
            subtitle="Sipho is still choosing subjects, so there is no NSC score yet. Switch Pitch Mode to Thandi to see the calculator with Grade 12 marks.">
            <button onClick={() => go("tool:chooser")}
              className="w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
              Open the Subject Chooser instead
            </button>
          </Screen>
        ) : (
          <ApsCalculator onBack={null} subjects={subjects} setSubjects={setSubjects}
            mathsIsPure={mathsIsPure} setMathsIsPure={setMathsIsPure} aps={aps} counts={counts}
            onExplore={() => go("explore:quals")} />
        )
      )}

      {session && !route && tab === "courses" && (
        <div className="p-4 pb-6">
          <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
            {exploreTabs.map((x) => (
              <button key={x.key} onClick={() => setExploreTab(x.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  exploreTab === x.key ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}>{x.label}</button>
            ))}
          </div>
          {exploreTab === "careers" && (
            <CareersDirectory fav={profile.favourites} toggleFav={toggleFav}
              onOpen={(id) => go(`career:${id}`)} fieldFilter={fieldFilter} setFieldFilter={setFieldFilter} />
          )}
          {exploreTab === "quals" && (
            <QualificationsDirectory ctx={ctx} fav={profile.favourites} toggleFav={toggleFav}
              onOpen={(id) => go(`qual:${id}`)} />
          )}
          {exploreTab === "providers" && <ProvidersDirectory fav={profile.favourites} toggleFav={toggleFav} />}
          {exploreTab === "advice" && <AdviceDirectory notify={remindEvent} />}
        </div>
      )}

      {session && !route && tab === "mentors" && (
        <MentorHub learner={learner} aps={learner.grade === 9 ? null : aps}
          requests={requests}
          setRequests={(updater) => {
            setRequests(updater);
            setProfile((p) => (p.requestSent ? p : { ...p, requestSent: true }));
          }} />
      )}

      {session && !route && tab === "advisor" && (
        <Advisor appLang={settings.lang} profile={profile} offline={settings.offline} />
      )}

      {session && !route && tab === "tools" && <ToolsHub t={t} go={go} profile={profile} />}

      {session && !route && tab === "offline" && (
        <OfflineCentre t={t} settings={settings} setSettings={setSettings} packs={packs} togglePack={togglePack}
          profile={profile} learner={learner} aps={aps} savedAt={savedAt} online={online}
          installable={!!installEvent} onInstall={install} onSaveNow={persist}
          storageKind={storage.available ? "IndexedDB with localStorage backup" : "in-memory (this browser blocks storage)"} />
      )}

      {session && !route && tab === "me" && (
        <MeScreen t={t} session={session} profile={profile} setProfile={setProfile}
          settings={settings} setSettings={setSettings} notifications={notifications}
          markAllRead={markAllRead} onSignOut={() => { setSession(null); setRole(null); setTab("dashboard"); setRoute(null); }}
          aps={aps} go={go} packs={packs} togglePack={togglePack} />
      )}
    </>
  );

  const modals = session && (
    <>
      {verifying && (
        <VerificationFlow role={role}
          onCancel={() => setVerifying(false)}
          onComplete={(v) => {
            const appId = `a-${Date.now()}`;
            setApplications((as) => [{
              id: appId, role, status: "pending", submitted: "just now",
              fullName: v.fullName, idNumber: v.idNumber, idDoc: v.idDoc,
              workEmail: v.workEmail, institution: v.institution || "",
              linkedin: v.linkedin, licenceBody: v.licenceBody, licenceNumber: v.licenceNumber,
              partnerCode: v.partnerCode, partnerName: v.partnerName, transcript: v.transcript,
              field: "", subjects: [], claim: "Submitted through the in-app verification flow.",
              submitSeconds: v.submitSeconds,
            }, ...as]);
            setSession((s) => ({ ...s, verification: v, applicationId: appId }));
            setVerifying(false);
          }} />
      )}
      {scanOpen && (
        <OcrScanModal learner={learner} onClose={() => setScanOpen(false)}
          onApply={() => { setScanOpen(false); setScanned(true); if (learner.grade >= 10) setTab("aps"); }} />
      )}
      {smsOpen && (
        <SmsSummaryModal learner={learner} aps={aps} matched={matchedQuals} profile={profile}
          packages={gr9Packages} onClose={() => setSmsOpen(false)} />
      )}
    </>
  );

  /* ---- masthead, shared by both layouts ---------------------------- */
  const PitchToggle = ({ compact }) => (
    <div className={`flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2 ${compact ? "" : "w-full"}`}>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-900">Pitch Mode</p>
        <p className="truncate text-[10px] text-slate-600">
          {pitchMode ? "Thandi · Grade 12, post-subject choice" : "Sipho · Grade 9, pre-subject choice"}
        </p>
      </div>
      <button role="switch" aria-checked={pitchMode} aria-label="Switch demo learner"
        onClick={() => { setPitchMode((v) => !v); setTab("dashboard"); setRoute(null); }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${pitchMode ? "k-bg-D4AF37" : "bg-slate-400"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${pitchMode ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );

  const HeaderActions = () => (
    <div className="flex items-center gap-1.5">
      {(settings.offline || settings.saveOffline) && (
        <span className="flex items-center gap-1 rounded-full k-bg-FBF5E7 px-2.5 py-1.5 text-[10px] font-semibold k-tx-6B5307 ring-1 k-rg-E4CE8A">
          <WifiOff className="h-3.5 w-3.5" />
          {settings.offline ? "Offline Mode Active" : "Saved offline"}
        </span>
      )}
      <button onClick={() => { setTab("me"); setRoute(null); }} aria-label={`Notifications, ${unread} unread`}
        className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full k-bg-B3261E px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
    </div>
  );

  const DeptBar = ({ tight }) => (
    <div className={`flex shrink-0 items-center gap-2.5 border-b-2 k-bd-00784A bg-white px-4 ${tight ? "py-2" : "py-2.5"}`}>
      <DhetArms className="h-8" />
      <div className="flex-1 leading-none">
        <p className="text-[11px] font-semibold lowercase tracking-tight text-slate-900">higher education &amp; training</p>
        <p className="mt-0.5 text-[8px] leading-tight text-slate-600">
          Department of Higher Education and Training<br />Republic of South Africa
        </p>
      </div>
      <KhethaWordmark className="h-6" />
    </div>
  );

  const ColourRule = () => (
    <div className="flex h-1.5 shrink-0">
      <span className="flex-1 k-bg-005A36" /><span className="flex-1 k-bg-D4AF37" />
      <span className="flex-1 k-bg-1E3A6E" /><span className="flex-1 k-bg-B3261E" />
      <span className="flex-1 k-bg-0F172A" />
    </div>
  );

  /* Which shell to render: explicit preview choice wins over the media query */
  const layout = viewport === "auto" ? (wide ? "desktop" : "mobile") : viewport;
  const shellWidth = layout === "tablet" ? "max-w-3xl" : "max-w-md";
  const shellHeight = layout === "tablet" ? "sm:h-[1000px]" : "sm:h-[880px]";

  const showNextStep =
    session && isStudent && showNextBar && !["dashboard"].includes(tab) && !route?.startsWith("tool:");

  const OfflinePill = () =>
    !online ? (
      <span className="flex items-center gap-1 rounded-full k-bg-FBF5E7 px-2.5 py-1.5 text-[10px] font-semibold k-tx-6B5307 ring-1 k-rg-E4CE8A">
        <WifiOff className="h-3.5 w-3.5" />Offline Mode Active
      </span>
    ) : (settings.offline || settings.saveOffline) ? (
      <button onClick={() => go("offline")}
        className="flex items-center gap-1 rounded-full k-bg-E7F4EE px-2.5 py-1.5 text-[10px] font-semibold k-tx-005A36 ring-1 k-rg-A8DCC5">
        <Download className="h-3.5 w-3.5" />{t("saved")}
      </button>
    ) : null;

  const mobileShell = (
    <div className="flex min-h-screen items-center justify-center p-0 sm:p-6">
      <div className={`relative flex h-screen w-full ${shellWidth} flex-col overflow-hidden bg-slate-50 shadow-2xl ${shellHeight} sm:rounded-[2.25rem] sm:border-[10px] sm:border-slate-900 ${shellClass}`}>
        <div className="hidden justify-center bg-white pt-2 sm:flex">
          <div className="h-1.5 w-24 rounded-full bg-slate-200" />
        </div>

        <DeptBar />

        <div className="shrink-0 bg-white px-4 pb-3 pt-3">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900">Njinji Career Guidance</h1>
              <p className="mt-1 text-[11px] leading-tight text-slate-600">
                Department of Higher Education &amp; Training · NCAP modern gateway
              </p>
            </div>
            {session && (
              <div className="flex items-center gap-1.5">
                <OfflinePill />
                <HeaderActions />
              </div>
            )}
          </div>
          {session && isStudent && <div className="mt-3"><PitchToggle /></div>}
          {session && !isStudent && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-white"
                style={{ background: ROLES[role].color }}>
                {React.createElement(ROLES[role].icon, { className: "h-3 w-3" })}
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-900">{ROLES[role].label}</span>
              <button onClick={() => { setRole(null); setSession(null); setRoute(null); }}
                className="shrink-0 text-[10px] font-semibold text-slate-600">Switch</button>
            </div>
          )}
        </div>
        <ColourRule />

        <main className="flex-1 overflow-y-auto" style={{ zoom: settings.textScale }}>
          <div className={layout === "tablet" ? "mx-auto w-full max-w-2xl" : ""}>{body}</div>
        </main>

        {showNextStep && <NextStepBar t={t} journey={journey} go={go} onDismiss={() => setShowNextBar(false)} />}

        {session && (
          <nav className="shrink-0 border-t border-slate-200 bg-white">
            <div className="grid grid-cols-5">
              {NAV.map((x) => {
                const Icon = x.icon;
                const active = tab === x.key && !route;
                return (
                  <button key={x.key} onClick={() => { setTab(x.key); setRoute(null); }}
                    aria-current={active ? "page" : undefined}
                    className={`flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                      active ? "font-semibold k-tx-005A36" : "font-medium text-slate-600"
                    }`}>
                    <Icon className={`h-5 w-5 ${active ? "stroke-[2.25]" : ""}`} />
                    {x.short || x.label}
                    <span className={`h-0.5 w-6 rounded-full ${active ? "k-bg-D4AF37" : "bg-transparent"}`} />
                  </button>
                );
              })}
              {NAV.length < 5 && SECONDARY.slice(0, 5 - NAV.length).map((x) => {
                const Icon = x.icon;
                const active = tab === x.key && !route;
                return (
                  <button key={x.key} onClick={() => { setTab(x.key); setRoute(null); }}
                    className={`flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                      active ? "font-semibold k-tx-005A36" : "font-medium text-slate-600"
                    }`}>
                    <Icon className="h-5 w-5" />
                    {x.label.split(" ")[0]}
                    <span className={`h-0.5 w-6 rounded-full ${active ? "k-bg-D4AF37" : "bg-transparent"}`} />
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {modals}
      </div>
    </div>
  );

  const desktopShell = (
    <div className={`flex min-h-screen ${shellClass}`} style={{ background: THEME.bg }}>
      <aside className="relative flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <DhetArms className="h-12" />
          <p className="mt-3 text-sm font-semibold lowercase leading-tight tracking-tight text-slate-900">
            higher education &amp; training
          </p>
          <p className="mt-1 text-[10px] leading-tight text-slate-600">Republic of South Africa</p>
        </div>

        <div className="px-5 py-4">
          <h1 className="text-base font-bold leading-tight tracking-tight text-slate-900">Njinji Career Guidance</h1>
          <p className="mt-1 text-[11px] leading-tight text-slate-600">NCAP modern gateway</p>
          <div className="mt-3"><KhethaWordmark className="h-7" /></div>
        </div>

        {session && (
          <>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3">
              {NAV.map((x) => {
                const Icon = x.icon;
                const active = tab === x.key && !route;
                return (
                  <button key={x.key} onClick={() => { setTab(x.key); setRoute(null); }}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      active ? "k-bg-005A36 font-semibold text-white" : "font-medium text-slate-700 hover:bg-slate-100"
                    }`}>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{x.label}</span>
                    {x.key === "mentors" && requests.filter((r) => r.status === "pending").length > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full k-bg-D4AF37 px-1 text-[10px] font-bold text-slate-900">
                        {requests.filter((r) => r.status === "pending").length}
                      </span>
                    )}
                    {x.key === "approvals" && applications.filter((a) => a.status === "pending").length > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full k-bg-B3261E px-1 text-[10px] font-bold text-white">
                        {applications.filter((a) => a.status === "pending").length}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="my-3 border-t border-slate-200" />
              {SECONDARY.map((x) => {
                const Icon = x.icon;
                const active = tab === x.key && !route;
                return (
                  <button key={x.key} onClick={() => { setTab(x.key); setRoute(null); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      active ? "bg-slate-900 font-semibold text-white" : "font-medium text-slate-700 hover:bg-slate-100"
                    }`}>
                    <Icon className="h-4 w-4 shrink-0" />{x.label}
                  </button>
                );
              })}
            </nav>

            {isStudent && journey.next && (
              <div className="mx-3 mb-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {t("stepOf", { n: journey.next.n, total: journey.total })}
                </p>
                <p className="mt-0.5 text-xs font-semibold leading-tight text-slate-900">{t(journey.next.labelKey)}</p>
                <div className="mt-2"><Progress value={journey.completed} max={journey.total} color={THEME.gold} /></div>
                <button onClick={() => go(journey.next.route)}
                  className="mt-2 w-full rounded-lg k-bg-005A36 px-3 py-1.5 text-[11px] font-semibold text-white">
                  {t("continueBtn")}
                </button>
              </div>
            )}

            <div className="space-y-2 border-t border-slate-200 p-3">
              {isStudent && <PitchToggle compact />}
              {isStudent && (
                <button onClick={() => setSmsOpen(true)}
                  className="flex w-full items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-900">
                  <MessageSquare className="h-3.5 w-3.5" />{t("sendSms")}
                </button>
              )}
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-white"
                  style={{ background: ROLES[role]?.color || THEME.primary }}>
                  {React.createElement(ROLES[role]?.icon || User, { className: "h-3 w-3" })}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-900">
                  {ROLES[role]?.label}
                </span>
                <button onClick={() => { setRole(null); setSession(null); setRoute(null); }}
                  className="shrink-0 text-[10px] font-semibold text-slate-600">Switch</button>
              </div>
            </div>
          </>
        )}
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {(NAV.concat(SECONDARY).find((x) => x.key === tab) || {}).label || "Njinji Career Guidance"}
            </h2>
            <p className="text-[11px] text-slate-600">
              {!role ? "Choose how you are joining"
                : !session ? `${ROLES[role].label} · sign in to continue`
                : isStudent ? `${learner.name} · Grade ${learner.grade} · ${learner.school}`
                : `${ROLES[role].label}${session.verification?.tiers?.length ? " · verified" : " · verification pending"}`}
            </p>
          </div>
          {session && (
            <div className="flex items-center gap-1.5">
              <OfflinePill />
              <HeaderActions />
            </div>
          )}
        </header>
        <ColourRule />

        <main className="flex-1 overflow-y-auto" style={{ zoom: settings.textScale }}>
          <div className={tab === "advisor" ? "h-full" : "mx-auto w-full max-w-5xl"}>{body}</div>
        </main>

        {modals}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-slate-200">
      <style>{a11yCss}</style>
      {layout === "desktop" ? desktopShell : mobileShell}
      <ViewportSwitcher value={viewport} onChange={setViewport} />
    </div>
  );
}


