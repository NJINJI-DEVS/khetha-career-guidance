// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import React from 'react';
import {
  MapPin, WifiOff, BellRing, ChevronRight, BookOpen, GraduationCap, Camera,
  CheckCircle2, Sparkles, MessageSquare, Award, PhoneCall,
} from 'lucide-react';
import { THEME } from '../../theme/tokens';
import { SUBJECT_LABELS } from '../../data/subjects';
import { FIELDS } from '../../data/fields';
import { OCCUPATIONS } from '../../data/occupations';
import { chooseSubjects } from '../../engines/subjects';
import { Pill } from '../ui/Pill';
import { Progress } from '../ui/Progress';
import { SectionTitle } from '../ui/SectionTitle';
import { JourneyRail } from './JourneyRail';
import { ToolsStrip } from './ToolsStrip';

/* ==================================================================
   R5 / R7: Home — the personalised career journey
   ================================================================== */

export function Dashboard({ t, learner, profile, go, notifications, offline, aps, eligibleCount, onScan, scanned, onSms, journey }) {
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
