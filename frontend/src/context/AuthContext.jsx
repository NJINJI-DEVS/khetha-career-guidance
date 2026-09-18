// Extracted from App.jsx's root component (NjinjiCareerGuidance): role,
// session, and the mentor/professional verification-modal flag. Genuinely
// global — gates almost every screen (routing, Mentor/Admin permission
// checks, MeScreen). The real learner profile lives in
// useMatriculantProfile, not here — this context is auth/role only.
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [session, updateSession] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const setSession = useCallback((value) => {
    if (value === null) {
      setVerifying(false);
      supabase.auth.signOut({ scope: 'local' });
    }
    updateSession(value);
  }, []);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { updateSession(null); setVerifying(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

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
