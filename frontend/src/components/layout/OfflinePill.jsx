// Extracted from App.jsx's root component (KhethaCareerGuidance).
// Originally an inline closure over `online`/`settings`/`go`/`t`; converted to
// explicit props — the root now does `onGoOffline={() => go("offline")}`.
import { WifiOff, Download } from 'lucide-react';

export function OfflinePill({ online, offline, saveOffline, onGoOffline, t }) {
  if (!online) {
    return (
      <span className="flex items-center gap-1 rounded-full k-bg-FBF5E7 px-2.5 py-1.5 text-[10px] font-semibold k-tx-6B5307 ring-1 k-rg-E4CE8A">
        <WifiOff className="h-3.5 w-3.5" />Offline Mode Active
      </span>
    );
  }
  if (offline || saveOffline) {
    return (
      <button onClick={onGoOffline}
        className="flex items-center gap-1 rounded-full k-bg-E7F4EE px-2.5 py-1.5 text-[10px] font-semibold k-tx-005A36 ring-1 k-rg-A8DCC5">
        <Download className="h-3.5 w-3.5" />{t("saved")}
      </button>
    );
  }
  return null;
}
