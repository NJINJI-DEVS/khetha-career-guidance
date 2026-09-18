import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { THEME } from './theme/tokens';
import { QUALIFICATIONS, qualById } from './data/qualifications';
import { providerById } from './data/providers';
import { DEMO_PROFILES } from './data/demoProfiles';
import { SEED_REQUESTS } from './data/mentors';
import { ROLES } from './data/roles';
import { SEED_APPLICATIONS } from './data/seedApplications';
import { toLevel } from './engines/levels';
import { chooseSubjects, eligibility } from './engines/subjects';
import { idbGet, idbSet } from './services/idb';
import { storage, STORE_KEY } from './services/storage';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { Screen } from './components/ui/Screen';
import { RoleSelector } from './components/auth/RoleSelector';
import { VerificationFlow } from './components/auth/VerificationFlow';
import { AuthScreen } from './components/auth/AuthScreen';
import { OcrScanModal } from './components/learner/OcrScanModal';
import { SmsSummaryModal } from './components/learner/SmsSummaryModal';
import { ViewportSwitcher } from './components/layout/ViewportSwitcher';
import { CareerDetail } from './components/explore/CareerDetail';
import { QualDetail } from './components/explore/QualDetail';
import { Advisor } from './components/advisor/Advisor';
import { useJourney } from './hooks/useJourney';
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
import { useAppNavigation } from './hooks/useAppNavigation';
import { MobileShell } from './components/layout/MobileShell';
import { DesktopShell } from './components/layout/DesktopShell';


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
  const { settings, setSettings, t } = useSettings();
  const {
    role, setRole, session, setSession, verifying, setVerifying,
    pitchMode, setPitchMode, learner,
  } = useAuth();

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

  const {
    tab, setTab, route, setRoute, exploreTab, setExploreTab, fieldFilter, setFieldFilter,
    go, NAV, SECONDARY, isStudent, exploreTabs,
  } = useAppNavigation({ role, t, onSms: () => setSmsOpen(true) });

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

  /* Which shell to render: explicit preview choice wins over the media query */
  const layout = viewport === "auto" ? (wide ? "desktop" : "mobile") : viewport;
  const shellWidth = layout === "tablet" ? "max-w-3xl" : "max-w-md";
  const shellHeight = layout === "tablet" ? "sm:h-[1000px]" : "sm:h-[880px]";

  const showNextStep =
    session && isStudent && showNextBar && !["dashboard"].includes(tab) && !route?.startsWith("tool:");

  const sharedHeaderProps = {
    offline: settings.offline,
    saveOffline: settings.saveOffline,
    unread,
    onOpenNotifications: () => { setTab("me"); setRoute(null); },
    online,
    onGoOffline: () => go("offline"),
    t,
  };

  const mobileShell = (
    <MobileShell
      shellWidth={shellWidth} shellHeight={shellHeight} shellClass={shellClass} layout={layout}
      session={session} isStudent={isStudent} role={role} setRole={setRole} setSession={setSession} setRoute={setRoute}
      textScale={settings.textScale} body={body} modals={modals}
      pitchMode={pitchMode} onTogglePitch={() => { setPitchMode((v) => !v); setTab("dashboard"); setRoute(null); }}
      {...sharedHeaderProps}
      showNextStep={showNextStep} journey={journey} go={go} onDismissNextBar={() => setShowNextBar(false)}
      NAV={NAV} SECONDARY={SECONDARY} tab={tab} setTab={setTab} route={route}
    />
  );

  const desktopShell = (
    <DesktopShell
      shellClass={shellClass} session={session} role={role} setRole={setRole} setSession={setSession} setRoute={setRoute}
      NAV={NAV} SECONDARY={SECONDARY} tab={tab} setTab={setTab} route={route}
      requests={requests} applications={applications}
      isStudent={isStudent} learner={learner} journey={journey} go={go}
      pitchMode={pitchMode} onTogglePitch={() => { setPitchMode((v) => !v); setTab("dashboard"); setRoute(null); }}
      onSendSms={() => setSmsOpen(true)}
      {...sharedHeaderProps}
      textScale={settings.textScale} body={body} modals={modals}
    />
  );

  return (
    <div className="min-h-screen w-full bg-slate-200">
      <style>{a11yCss}</style>
      {layout === "desktop" ? desktopShell : mobileShell}
      <ViewportSwitcher value={viewport} onChange={setViewport} />
    </div>
  );
}


