// Extracted from App.jsx's root component (NjinjiCareerGuidance) — the
// `mobileShell` JSX tree. Receives everything it needs as props; the root
// still owns all the underlying state and just threads it down.
import React from 'react';
import { ROLES } from '../../data/roles';
import { NextStepBar } from '../learner/NextStepBar';
import { DeptBar } from './DeptBar';
import { ColourRule } from './ColourRule';
import { HeaderActions } from './HeaderActions';
import { OfflinePill } from './OfflinePill';

export function MobileShell({
  shellWidth, shellHeight, shellClass, layout,
  session, isStudent, role, setRole, setSession, setRoute,
  textScale, body, modals,
  offline, saveOffline, unread, onOpenNotifications, onOpenProfile, identity,
  online, onGoOffline, t,
  showNextStep, journey, go, onDismissNextBar,
  NAV, SECONDARY, tab, setTab, route,
}) {
  return (
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
                <OfflinePill online={online} offline={offline} saveOffline={saveOffline} onGoOffline={onGoOffline} t={t} />
                <HeaderActions offline={offline} saveOffline={saveOffline} unread={unread} onOpenNotifications={onOpenNotifications}
                  onOpenProfile={onOpenProfile} identity={identity}
                  onSignOut={() => { setRole(null); setSession(null); setRoute(null); }} />
              </div>
            )}
          </div>
          {session && !isStudent && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-white"
                style={{ background: ROLES[role].color }}>
                {React.createElement(ROLES[role].icon, { className: "h-3 w-3" })}
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-900">{ROLES[role].label}</span>
              <button onClick={() => { setRole(null); setSession(null); setRoute(null); }}
                className="shrink-0 text-[10px] font-semibold text-slate-600">Log out</button>
            </div>
          )}
        </div>
        <ColourRule />

        <main className="flex-1 overflow-y-auto" style={{ zoom: textScale }}>
          <div className={layout === "tablet" ? "mx-auto w-full max-w-2xl" : ""}>{body}</div>
        </main>

        {showNextStep && <NextStepBar t={t} journey={journey} go={go} onDismiss={onDismissNextBar} />}

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
}
