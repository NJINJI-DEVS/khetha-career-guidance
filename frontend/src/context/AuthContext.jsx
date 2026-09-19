// Extracted from App.jsx's root component (KhethaCareerGuidance): role,
// session, and the mentor/professional verification-modal flag. Genuinely
// global — gates almost every screen (routing, Mentor/Admin permission
// checks, MeScreen). The real learner profile lives in
// useMatriculantProfile, not here — this context is auth/role only.
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getMyAccountRole, getMyConsent, getMyAdmin } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [session, updateSession] = useState(null);
  const [verifying, setVerifying] = useState(false);
  // True until the one-time restoration attempt below finishes, so the app
  // doesn't flash the role-selection screen for someone who is really still
  // signed in.
  const [authLoading, setAuthLoading] = useState(true);
  const setSession = useCallback((value) => {
    if (value === null) {
      setVerifying(false);
      supabase.auth.signOut({ scope: 'local' });
    }
    updateSession(value);
  }, []);

  // The Supabase SDK itself persists its token (localStorage, on by default)
  // and restores it before this ever runs — but `role`/`session` here are
  // this app's own state, rebuilt from nothing on every load. Without this,
  // a refresh always dropped back to the role-selection screen even though
  // the underlying auth session was still perfectly valid.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session: supaSession } } = await supabase.auth.getSession();
      if (!supaSession) { setAuthLoading(false); return; }

      try {
        const { role: accountRole } = await getMyAccountRole();
        if (cancelled) return;

        if (accountRole === 'admin') {
          const admin = await getMyAdmin();
          if (cancelled) return;
          setRole('admin');
          updateSession({
            method: 'email',
            identity: admin.email || supaSession.user.email,
            admin,
            isAdmin: true,
            trustDevice: true,
            consent: { core: true, notify: false, research: false },
            ageGate: { minor: false },
            signedInAt: new Date(),
          });
        } else {
          // Same shape AuthScreen.afterAuth builds after a fresh sign-in —
          // see its `enter()` — so nothing downstream can tell the
          // difference between a restored session and a brand new one.
          const consentRecord = await getMyConsent().catch(() => null);
          if (cancelled) return;
          setRole(accountRole);
          updateSession({
            method: supaSession.user.phone ? 'phone' : 'email',
            identity: supaSession.user.email || supaSession.user.phone,
            role: accountRole,
            trustDevice: true,
            consent: consentRecord
              ? { core: consentRecord.core, notify: consentRecord.notify, research: consentRecord.research }
              : { core: true, notify: false, research: false },
            ageGate: consentRecord
              ? { minor: consentRecord.isMinor,
                  dateOfBirth: consentRecord.dateOfBirth ?? null,
                  guardian: consentRecord.guardianName
                    ? { name: consentRecord.guardianName, relation: consentRecord.guardianRelation,
                        contact: consentRecord.guardianContact }
                    : undefined }
              : { minor: false },
            consentOnFile: !!consentRecord,
            signedInAt: new Date(),
          });
        }
      } catch {
        // Couldn't confirm the account (offline, backend down, or a token
        // that's no longer valid) — fall through to the normal sign-in
        // screen rather than guessing at a role. role/session stay null.
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { updateSession(null); setVerifying(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      role, setRole, session, setSession, verifying, setVerifying, authLoading,
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
