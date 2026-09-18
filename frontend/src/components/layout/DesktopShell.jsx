// Extracted from App.jsx's root component (NjinjiCareerGuidance) — the
// `desktopShell` JSX tree. Receives everything it needs as props; the root
// still owns all the underlying state and just threads it down.
import React from 'react';
import { MessageSquare, User } from 'lucide-react';
import { THEME } from '../../theme/tokens';
import { ROLES } from '../../data/roles';
import { Progress } from '../ui/Progress';
import { DhetArms, KhethaWordmark } from '../ui/BrandMarks';
import { ColourRule } from './ColourRule';
import { HeaderActions } from './HeaderActions';
import { OfflinePill } from './OfflinePill';

export function DesktopShell({
  shellClass, session, role, setRole, setSession, setRoute,
  NAV, SECONDARY, tab, setTab, route,
  requests, applications,
  isStudent, learner, journey, t, go,
  onSendSms,
  offline, saveOffline, unread, onOpenNotifications, onOpenProfile, identity, avatar, online, onGoOffline,
  textScale, body, modals,
}) {
  return (
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
              {isStudent && (
                <button onClick={onSendSms}
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
                  className="shrink-0 text-[10px] font-semibold text-slate-600">Log out</button>
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
                : isStudent
                  ? (learner ? `${learner.name} · Grade ${learner.grade} · ${learner.school || "—"}` : "Setting up your profile…")
                : `${ROLES[role].label}${session.verification?.tiers?.length ? " · verified" : " · verification pending"}`}
            </p>
          </div>
          {session && (
            <div className="flex items-center gap-1.5">
              <OfflinePill online={online} offline={offline} saveOffline={saveOffline} onGoOffline={onGoOffline} t={t} />
              <HeaderActions offline={offline} saveOffline={saveOffline} unread={unread} onOpenNotifications={onOpenNotifications}
                onOpenProfile={onOpenProfile} identity={identity} avatar={avatar}
                onSignOut={() => { setRole(null); setSession(null); setRoute(null); }} />
            </div>
          )}
        </header>
        <ColourRule />

        <main className="flex-1 overflow-y-auto" style={{ zoom: textScale }}>
          <div className={tab === "advisor" ? "h-full" : "mx-auto w-full max-w-5xl"}>{body}</div>
        </main>

        {modals}
      </div>
    </div>
  );
}
