import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Note: intentionally not wrapped in <React.StrictMode>. The app relies on several
// effects (OTP timers, auto-created notifications) that StrictMode's dev-only double-
// invoke would fire twice, which is confusing to test against even though it wouldn't
// happen in production. Add StrictMode back once those effects are made idempotent.
ReactDOM.createRoot(document.getElementById('root')).render(
  <SettingsProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SettingsProvider>
);
