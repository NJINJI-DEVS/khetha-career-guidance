// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { ShieldCheck, WifiOff, Smartphone, Download, Check } from 'lucide-react';
import { qualById } from '../../data/qualifications';
import { occById } from '../../data/occupations';

/* Screen the learner opens with no connection at all */
export function OfflineCentre({ t, settings, setSettings, packs, togglePack, profile, learner, aps,
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
