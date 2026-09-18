// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import {
  ShieldCheck, Plug, Languages, Accessibility, Type, Contrast, RefreshCw, Info, WifiOff,
  BellRing, FileDown, Trash2, LogOut, Bell, Heart, ClipboardList, ChevronRight, Volume2, Users,
  Settings, Pencil, Route, Monitor, Download,
} from 'lucide-react';
import { Avatar, ProfileEditor } from './ProfileEditor';
import { occById } from '../../data/occupations';
import { qualById } from '../../data/qualifications';
import { providerById } from '../../data/providers';
import { LANGUAGES } from '../../data/i18n';
import { VIEWPORTS } from '../../data/viewports';
import { CONSENT_ITEMS } from '../../data/auth';
import { Pill } from '../ui/Pill';
import { EmptyState } from '../ui/EmptyState';
import { SectionTitle } from '../ui/SectionTitle';

/* ==================================================================
   R5 / R6 / R7 / A2: Me — journey, saved, settings, privacy
   ================================================================== */

export function MeScreen({ t, session, profile, setProfile, settings, setSettings, notifications, markAllRead, onSignOut, aps, go, packs, togglePack, viewport, setViewport, installable, onInstall }) {
  const [tab, setTab] = useState("journey");
  const [editorOpen, setEditorOpen] = useState(false);
  const shownName = profile.displayName || session.identity;
  const favCareers = profile.favourites.filter((id) => occById[id]);
  const favQuals = profile.favourites.filter((id) => qualById[id]);
  const favProviders = profile.favourites.filter((id) => providerById[id]);

  const tabs = [
    { key: "journey", label: t("myJourney"), icon: Route },
    { key: "saved", label: `${t("saved")} (${profile.favourites.length})`, icon: Heart },
    { key: "settings", label: t("settings"), icon: Settings },
  ];

  return (
    <div className="p-4 pb-6">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Avatar name={shownName} avatar={profile.avatar} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold text-slate-900">{shownName}</p>
            <button onClick={() => setEditorOpen(true)} aria-label="Edit your profile"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              <Pencil className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-slate-600">
            {session.guest
              ? "Guest — nothing stored off this device"
              : `Khetha account · signed in with ${session.method}`}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Pill tone="green" icon={ShieldCheck}>2-step on</Pill>
            {session.consent?.ncap && <Pill tone="blue" icon={Plug}>NCAP synced</Pill>}
            {session.ageGate?.minor && <Pill tone="gold" icon={Users}>Guardian consent on file</Pill>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {tabs.map((x) => {
          const Icon = x.icon;
          return (
            <button key={x.key} onClick={() => setTab(x.key)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
                tab === x.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}>
              <Icon className="h-3.5 w-3.5 shrink-0" />{x.label}
            </button>
          );
        })}
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

          {/* Preview layout — moved here from a floating bar that covered the
              bottom navigation and made the tabs underneath unclickable. */}
          {setViewport && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Monitor className="h-4 w-4" />Preview layout
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Auto follows your screen size. The others force a layout, which is useful for showing the app on a
                projector or checking a phone view from a laptop.
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {VIEWPORTS.map((v) => {
                  const Icon = v.icon;
                  return (
                    <button key={v.key} onClick={() => setViewport(v.key)} aria-pressed={viewport === v.key}
                      className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors ${
                        viewport === v.key ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                      <Icon className="h-3.5 w-3.5" />{v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {installable && (
            <button onClick={onInstall}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed k-bd-00784A k-bg-E7F4EE p-4 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-005A36 text-white">
                <Download className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold k-tx-005A36">Install Khetha on this device</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">
                  Adds it to your home screen and lets it open full screen, offline.
                </span>
              </span>
            </button>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Accessibility className="h-4 w-4" />{t("accessibility")}
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium text-slate-700"><Type className="h-3.5 w-3.5" />{t("textSize")}</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[{ v: 1, l: t("standard") }, { v: 1.25, l: t("large") }, { v: 1.5, l: t("largest") }, { v: 2, l: "200%" }].map((o) => (
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
                { key: "readAloud", icon: Volume2, label: "Read aloud", note: "Adds a speaker button to questions and results, in your chosen language." },
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

      {editorOpen && (
        <ProfileEditor
          name={shownName}
          avatar={profile.avatar}
          onClose={() => setEditorOpen(false)}
          onSave={(patch) => setProfile((p) => ({ ...p, ...patch }))}
        />
      )}
    </div>
  );
}
