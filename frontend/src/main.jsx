import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { SharedCvRoute } from './components/cv/CvWizard';
import './index.css';
// Loaded after index.css so the dark-mode neutral overrides sit below
// Tailwind's utilities in the cascade.
import './theme/theme.css';

// Note: intentionally not wrapped in <React.StrictMode>. The app relies on several
// effects (OTP timers, auto-created notifications) that StrictMode's dev-only double-
// invoke would fire twice, which is confusing to test against even though it wouldn't
// happen in production. Add StrictMode back once those effects are made idempotent.
// A ?cv=<token> link is opened by an employer or bursary officer who has no
// account, so it bypasses the app entirely rather than routing them through the
// role picker and sign-in. Checked here, before mount, so no provider or auth
// state is involved at all.
const sharedCvToken = new URLSearchParams(window.location.search).get('cv');

ReactDOM.createRoot(document.getElementById('root')).render(
  sharedCvToken ? (
    <SharedCvRoute token={sharedCvToken} />
  ) : (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <ProfileProvider>
            <App />
          </ProfileProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
);

// Service worker: registered after load so it never competes with first paint
// on a slow connection. Dev is excluded — a cached shell in dev hides your own
// edits behind a stale build, which costs more time than it saves.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed", err);
    });
  });
}
