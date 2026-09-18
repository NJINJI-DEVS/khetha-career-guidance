// "Add to home screen" prompt.
//
// Two paths, because the platforms differ:
//   Android/Chrome — fires beforeinstallprompt, which App.jsx captures. We can
//                    show a real install button that opens the native sheet.
//   iOS/Safari     — never fires it and offers no API. The only route is the
//                    Share sheet, so the prompt becomes instructions instead.
//
// Suppressed once already installed, and a dismissal is remembered so the app
// does not nag. localStorage is wrapped because it throws in private mode.

import { useState, useEffect } from 'react';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';

const DISMISS_KEY = "khetha.install.dismissed";

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

const isIos = () =>
  typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

const wasDismissed = () => {
  try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
};
const remember = () => {
  try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* private mode */ }
};

export function InstallPrompt({ installable, onInstall }) {
  const [dismissed, setDismissed] = useState(true);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return;
    setIos(isIos());
    /* Give the learner a moment to see what the app is before asking to
       install it — a prompt on first paint gets dismissed reflexively. */
    const timer = setTimeout(() => setDismissed(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const close = () => { setDismissed(true); remember(); };

  // Android needs a captured prompt; iOS needs none, since we only instruct.
  if (dismissed || (!installable && !ios)) return null;

  return (
    <div className="shrink-0 border-t k-bd-00432A k-bg-005A36 p-3.5 text-white">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-D4AF37 text-slate-900">
          <Smartphone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Add Khetha to your home screen</p>
          {ios ? (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] leading-relaxed k-tx-BFE5D4">
              Tap <Share className="inline h-3.5 w-3.5" /> Share, then
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                <Plus className="h-3.5 w-3.5" />Add to Home Screen
              </span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] leading-relaxed k-tx-BFE5D4">
              Opens full screen, works offline, and uses far less data than the browser.
            </p>
          )}
        </div>
        <button onClick={close} aria-label="Not now"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15">
          <X className="h-4 w-4" />
        </button>
      </div>

      {!ios && (
        <button onClick={() => { onInstall?.(); close(); }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl k-bg-D4AF37 py-2.5 text-sm font-semibold text-slate-900">
          <Download className="h-4 w-4" />Install
        </button>
      )}
    </div>
  );
}
