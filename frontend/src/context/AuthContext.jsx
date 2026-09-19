// Extracted from App.jsx's root component (KhethaCareerGuidance): role,
// session, and the mentor/professional verification-modal flag. Genuinely
// global — gates almost every screen (routing, Mentor/Admin permission
// checks, MeScreen). The real learner profile lives in
// useMatriculantProfile, not here — this context is auth/role only.
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null);
  const [verifying, setVerifying] = useState(false);

  return (
    <AuthContext.Provider value={{
      role, setRole, session, setSession, verifying, setVerifying,
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
