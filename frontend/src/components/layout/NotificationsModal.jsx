// Split out of MeScreen's "journey" tab, where the notification feed used to
// live mixed in with saved-tool results. The bell icon in the header now
// opens this directly instead of routing to the profile tab — notifications
// and the profile are two different things and shouldn't share one screen.
import { Bell } from 'lucide-react';
import { ModalShell } from '../ui/ModalShell';

export function NotificationsModal({ notifications, markAllRead, onClose }) {
  return (
    <ModalShell title="Notifications" onClose={onClose}>
      {notifications.some((n) => !n.read) && (
        <div className="mb-3 flex justify-end">
          <button onClick={markAllRead} className="text-xs font-semibold k-tx-005A36">Mark all read</button>
        </div>
      )}
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
    </ModalShell>
  );
}
