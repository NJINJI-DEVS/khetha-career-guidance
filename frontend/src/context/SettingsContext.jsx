// Extracted from App.jsx's root component (NjinjiCareerGuidance): the
// `settings` state (language, accessibility, offline preferences) and the
// `t` translator derived from it. Broad read fan-out (nearly every screen
// reads `t`/settings), narrow write surface (only the settings screen) —
// the textbook case for Context over prop-drilling.
import { createContext, useContext, useState } from 'react';
import { useT } from '../hooks/useT';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  lang: "en", textScale: 1, highContrast: false, reduceMotion: false,
  simpleLanguage: false, offline: false, saveOffline: false,
  notifyDeadlines: true, notifyEvents: true, notifyNsfas: true,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const t = useT(settings.lang);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
