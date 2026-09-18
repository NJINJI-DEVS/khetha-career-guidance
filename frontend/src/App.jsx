import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Home, Compass, Wrench, MessageCircle, User, Calculator, Search, Camera, GraduationCap, Briefcase, FlaskConical, ShieldCheck, CalendarClock, ChevronRight, ChevronLeft, Sparkles, Send, Loader2, X, BookOpen, MapPin, Award, AlertTriangle, CheckCircle2, Building2, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Smartphone, KeyRound, LogOut, Heart, Bell, BellRing, Download, WifiOff, Type, Contrast, Languages, Trash2, FileDown, Plug, RefreshCw, Accessibility, ClipboardList, Target, Users, TrendingUp, CircleHelp, PhoneCall, MessageSquare, CalendarDays, Star, Info, Check } from 'lucide-react';
import { THEME, KHETHA } from './theme/tokens';
import { LANGUAGES, STRINGS } from './data/i18n';
import { NSC_BANDS, SUBJECT_LABELS } from './data/subjects';
import { FIELDS, FIELD } from './data/fields';
import { OCCUPATIONS, occById } from './data/occupations';
import { QUALIFICATIONS, qualById } from './data/qualifications';
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
import { idbOpen, idbGet, idbSet } from './services/idb';
import { storage, STORE_KEY } from './services/storage';
import { useT } from './hooks/useT';
import { Pill } from './components/ui/Pill';
import { SectionTitle } from './components/ui/SectionTitle';
import { Screen } from './components/ui/Screen';
import { FavouriteButton } from './components/ui/FavouriteButton';
import { Likert } from './components/ui/Likert';
import { Progress } from './components/ui/Progress';
import { EmptyState } from './components/ui/EmptyState';
import { DhetArms, KhethaWordmark, SaStripe } from './components/ui/BrandMarks';
import { TierBadges } from './components/ui/TierBadges';
import { LanguagePicker } from './components/ui/LanguagePicker';
import { GoogleMark, AppleMark } from './components/ui/SocialMarks';
import { ModalShell } from './components/ui/ModalShell';
import { SearchBar } from './components/ui/SearchBar';
import { Chips } from './components/ui/Chips';
import { VerificationBadge } from './components/ui/VerificationBadge';
import { RoadmapCallout } from './components/ui/RoadmapCallout';
import { StatCard } from './components/ui/StatCard';
import { BarRow } from './components/ui/BarRow';
import { Donut } from './components/ui/Donut';
import { Panel } from './components/ui/Panel';
import { RoleSelector } from './components/auth/RoleSelector';
import { VerificationFlow } from './components/auth/VerificationFlow';
import { AuthScreen } from './components/auth/AuthScreen';
import { OcrScanModal } from './components/learner/OcrScanModal';
import { SmsSummaryModal } from './components/learner/SmsSummaryModal';
import { ViewportSwitcher } from './components/layout/ViewportSwitcher';
import { CareerDetail } from './components/explore/CareerDetail';
import { QualDetail } from './components/explore/QualDetail';
import { MentorChat } from './components/mentor/MentorChat';
import { RequestLetterModal } from './components/mentor/RequestLetterModal';
import { RecommendationLetterModal } from './components/mentor/RecommendationLetterModal';
import { ApplicationDetail } from './components/admin/ApplicationDetail';
import { VettingGuide } from './components/admin/VettingGuide';
import { Advisor } from './components/advisor/Advisor';


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




/* ---------- NSC scoring (R2, APS tool) ---------------------------- */


/* ---------- R1/R4: NCAP career fields ----------------------------- */

/* ---------- R4a: Careers (occupations) directory ------------------
   Context vector is used by the Job Fit questionnaire (R3):
   people / data / things / outdoors / routine, each 0-4.            */

/* ---------- R4b: What to study (qualifications) -------------------- */

/* ---------- R4c: Where to study (learning providers) --------------- */

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

/* ==================================================================
   Multi-role architecture
   ================================================================== */


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

/* ==================================================================
   Screen 4: Verified Mentor, Tutor and Professional Connect Network
   ================================================================== */

/* Safety guardrail: contact details are redacted before a message is
   ever stored or delivered. Runs on send, not on display, so the raw
   string never reaches the other learner's device. */



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


