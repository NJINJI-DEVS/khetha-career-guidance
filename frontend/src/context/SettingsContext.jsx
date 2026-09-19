// The single store for everything a learner has *declared*: language,
// accessibility, notifications, and what they are looking for.
//
// Previously this was React state only, so every setting reset on reload and
// onboarding questions were effectively asked again on each device. It now
// hydrates from the learner's saved preferences on sign-in and writes changes
// back, which is what makes "never ask twice" true rather than aspirational.
//
// Write path notes:
//   - Saves are debounced. Dragging a text-scale control fires a change per
//     step; without this that is one PUT per step.
//   - Hydration must not trigger a save. `hydrating` guards that, otherwise
//     loading the server's copy immediately writes it straight back.
//   - A failed save is swallowed. Settings are not worth an error banner over,
//     the local state is already correct, and the next change retries.

import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useT } from '../hooks/useT';
import { updateMyPreferences } from '../lib/api';

const SettingsContext = createContext(null);

export const DEFAULT_SETTINGS = {
  // Interface
  lang: "en",
  textScale: 1,
  highContrast: false,
  reduceMotion: false,
  simpleLanguage: false,
  readAloud: false,

  // Offline
  offline: false,
  saveOffline: false,

  // Notifications
  notifyDeadlines: true,
  notifyEvents: true,
  notifyNsfas: true,
  notifyMentorReplies: true,

  // What they are looking for — captured at onboarding, editable in settings
  fieldsOfInterest: [],
  careerGoals: [],
  educationLevel: null,
  preferredProvince: null,
  studyMode: "any",
  maxTravelKm: null,

  // Set once preferences have been saved at least once. Its absence is how the
  // app knows to ask; its presence is how it knows never to ask again.
  preferencesCapturedAt: null,
};

/** Server shape (LearnerPreferences) -> local settings shape. */
function fromServer(p) {
  if (!p) return null;
  return {
    lang: p.language ?? DEFAULT_SETTINGS.lang,
    textScale: p.textScale ?? 1,
    highContrast: !!p.highContrast,
    reduceMotion: !!p.reduceMotion,
    simpleLanguage: !!p.simpleLanguage,
    readAloud: !!p.readAloud,
    offline: DEFAULT_SETTINGS.offline, // a per-device state, never synced
    saveOffline: !!p.saveOffline,
    notifyDeadlines: p.notifyDeadlines ?? true,
    notifyEvents: p.notifyEvents ?? true,
    notifyNsfas: p.notifyNsfas ?? true,
    notifyMentorReplies: p.notifyMentorReplies ?? true,
    fieldsOfInterest: p.fieldsOfInterest ?? [],
    careerGoals: p.careerGoals ?? [],
    educationLevel: p.educationLevel ?? null,
    preferredProvince: p.preferredProvince ?? null,
    studyMode: p.studyMode ?? "any",
    maxTravelKm: p.maxTravelKm ?? null,
    preferencesCapturedAt: p.updatedAt ?? null,
  };
}

/** Local settings shape -> server shape. `themeMode` is owned by ThemeContext
 *  and passed in, so the theme choice follows the learner between devices. */
function toServer(s, themeMode) {
  return {
    language: s.lang,
    themeMode: themeMode || "system",
    textScale: s.textScale,
    highContrast: s.highContrast,
    reduceMotion: s.reduceMotion,
    simpleLanguage: s.simpleLanguage,
    readAloud: s.readAloud,
    saveOffline: s.saveOffline,
    notifyDeadlines: s.notifyDeadlines,
    notifyEvents: s.notifyEvents,
    notifyNsfas: s.notifyNsfas,
    notifyMentorReplies: s.notifyMentorReplies,
    fieldsOfInterest: s.fieldsOfInterest ?? [],
    careerGoals: s.careerGoals ?? [],
    educationLevel: s.educationLevel,
    preferredProvince: s.preferredProvince,
    studyMode: s.studyMode,
    maxTravelKm: s.maxTravelKm,
  };
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const t = useT(settings.lang);

  // Nothing is written back until a profile has been hydrated at least once.
  // Without this, a signed-out visitor's defaults would be saved over a real
  // learner's preferences the moment they signed in.
  const [ready, setReady] = useState(false);
  const hydrating = useRef(false);
  const themeModeRef = useRef("system");
  const timer = useRef(null);

  const hydrate = useCallback((serverPrefs) => {
    const mapped = fromServer(serverPrefs);
    hydrating.current = true;
    if (mapped) setSettings((s) => ({ ...s, ...mapped }));
    setReady(true);
    // Cleared on a later tick so the save effect sees the flag for the render
    // that the hydrated state lands in.
    setTimeout(() => { hydrating.current = false; }, 0);
  }, []);

  /** Lets ThemeContext keep the server copy of the theme choice in step. */
  const setThemeModeForSync = useCallback((mode) => { themeModeRef.current = mode; }, []);

  useEffect(() => {
    if (!ready || hydrating.current) return undefined;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      updateMyPreferences(toServer(settings, themeModeRef.current)).catch(() => {
        // Offline, signed out, or no profile yet. The local state stands and
        // the next change will try again.
      });
    }, 800);
    return () => clearTimeout(timer.current);
  }, [settings, ready]);

  return (
    <SettingsContext.Provider
      value={{ settings, setSettings, t, hydrate, ready, setThemeModeForSync }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
