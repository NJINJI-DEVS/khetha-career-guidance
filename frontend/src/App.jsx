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
import { useJourney } from './hooks/useJourney';
import { NextStepBar } from './components/learner/NextStepBar';
import { OfflineCentre } from './components/learner/OfflineCentre';
import { Dashboard } from './components/learner/Dashboard';
import { SubjectChooser } from './components/learner/SubjectChooser';
import { Questionnaire } from './components/learner/Questionnaire';
import { ApsCalculator } from './components/learner/ApsCalculator';
import { ToolsHub } from './components/learner/ToolsHub';
import { MeScreen } from './components/learner/MeScreen';
import { CareersDirectory } from './components/explore/CareersDirectory';
import { QualificationsDirectory } from './components/explore/QualificationsDirectory';
import { ProvidersDirectory } from './components/explore/ProvidersDirectory';
import { AdviceDirectory } from './components/explore/AdviceDirectory';
import { MentorHub } from './components/mentor/MentorHub';
import { MentorWorkspace } from './components/mentor/MentorWorkspace';
import { AdminApprovals } from './components/admin/AdminApprovals';
import { AdminAnalytics } from './components/admin/AdminAnalytics';


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


