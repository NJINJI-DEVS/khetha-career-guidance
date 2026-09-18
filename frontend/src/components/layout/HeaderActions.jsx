// Extracted from App.jsx's root component (NjinjiCareerGuidance).
// Originally an inline closure over `settings`/`setTab`/`setRoute`/`unread`;
// converted to explicit props so it can live in its own file — the root now
// does `onOpenNotifications={() => { setTab("me"); setRoute(null); }}`.
import { WifiOff, Bell, LogOut } from 'lucide-react';

export function HeaderActions({ offline, saveOffline, unread, onOpenNotifications, onOpenProfile, identity, onSignOut }) {
  return (
    <div className="flex items-center gap-1.5">
      {(offline || saveOffline) && (
        <span className="flex items-center gap-1 rounded-full k-bg-FBF5E7 px-2.5 py-1.5 text-[10px] font-semibold k-tx-6B5307 ring-1 k-rg-E4CE8A">
          <WifiOff className="h-3.5 w-3.5" />
          {offline ? "Offline Mode Active" : "Saved offline"}
        </span>
      )}
      <button onClick={onOpenNotifications} aria-label={`Notifications, ${unread} unread`}
        className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full k-bg-B3261E px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {/* Profile lives in SECONDARY nav, which the 5-slot mobile bar never has
          room for — without this the learner could not reach it at all. */}
      {onOpenProfile && (
        <button onClick={onOpenProfile} aria-label="My profile and settings"
          className="grid h-9 w-9 place-items-center rounded-full k-bg-005A36 text-[11px] font-bold text-white ring-1 k-rg-00784A">
          {(identity || "K").slice(0, 2).toUpperCase()}
        </button>
      )}
      {onSignOut && (
        <button onClick={onSignOut} aria-label="Log out"
          className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
