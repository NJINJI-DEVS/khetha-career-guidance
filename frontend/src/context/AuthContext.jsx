// Extracted from App.jsx's root component (NjinjiCareerGuidance): role,
// session, and the mentor/professional verification-modal flag. Genuinely
// global — gates almost every screen (routing, Mentor/Admin permission
// checks, MeScreen). `pitchMode` (the two-hardcoded-demo-personas toggle)
// rides along here as a dev-only override; it's the de facto "current
// user" until real multi-user auth replaces it, at which point this
// field is the one to delete.
import { createContext, useContext, useState } from 'react';
import { DEMO_PROFILES } from '../data/demoProfiles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null);
  const [verifying, setVerifying] = useState(false);

  /* Pitch Mode: false = Sipho (Grade 9), true = Thandi (Grade 12) */
  const [pitchMode, setPitchMode] = useState(true);
  const learner = pitchMode ? DEMO_PROFILES.thandi : DEMO_PROFILES.sipho;

  return (
    <AuthContext.Provider value={{
      role, setRole, session, setSession, verifying, setVerifying,
      pitchMode, setPitchMode, learner,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
