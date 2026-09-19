// Resolves the active colour theme and writes it to <html data-theme>.
//
// Three-state preference, not a boolean: "system" | "light" | "dark".
// A boolean cannot express "follow my phone", which is the behaviour most
// people actually want — and the whole point of the feature, since Android
// flips the whole device to dark when battery saver kicks in. But it must be a
// *choice*, so someone who has explicitly picked Light keeps Light when that
// happens.
//
// Reading and applying happen before first paint (see initTheme, called from
// index.html's inline script) so the app never flashes white then repaints
// dark.

import { useState, useEffect, useCallback } from 'react';

export const THEME_KEY = 'khetha.theme';
export const THEME_MODES = ['system', 'light', 'dark'];

const mql = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

export function readStoredMode() {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return THEME_MODES.includes(v) ? v : 'system';
  } catch {
    // Private windows and sandboxed frames throw on access rather than
    // returning null, and the app has to keep working in both.
    return 'system';
  }
}

export function resolveTheme(mode) {
  if (mode === 'light' || mode === 'dark') return mode;
  return mql()?.matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  // Keeps the mobile browser chrome (address bar, status bar) in step with the
  // page instead of leaving a white bar above a dark app.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B1220' : '#005A36');
}

export function useTheme() {
  const [mode, setMode] = useState(readStoredMode);
  const [theme, setTheme] = useState(() => resolveTheme(readStoredMode()));

  // Apply, persist, and follow the OS while the mode is "system".
  useEffect(() => {
    const next = resolveTheme(mode);
    setTheme(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, mode);
    } catch { /* storage unavailable — the choice lasts for this session only */ }

    if (mode !== 'system') return undefined;
    const m = mql();
    if (!m) return undefined;
    const onChange = (e) => {
      const t = e.matches ? 'dark' : 'light';
      setTheme(t);
      applyTheme(t);
    };
    // addListener is the Safari < 14 spelling; iOS is a large share of this
    // audience and some of those devices are still on it.
    if (m.addEventListener) m.addEventListener('change', onChange);
    else m.addListener(onChange);
    return () => {
      if (m.removeEventListener) m.removeEventListener('change', onChange);
      else m.removeListener(onChange);
    };
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((m) => THEME_MODES[(THEME_MODES.indexOf(m) + 1) % THEME_MODES.length]);
  }, []);

  return { mode, setMode, theme, cycle, isDark: theme === 'dark' };
}
