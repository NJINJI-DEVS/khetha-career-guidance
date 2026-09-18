// Real Supabase Auth calls, used by AuthScreen. Each function returns
// Supabase's own { data, error } shape untouched — callers decide how to
// surface `error` (e.g. "provider not enabled") rather than this layer
// papering over it.
import { supabase } from '../lib/supabaseClient';

export const signInWithPassword = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUpWithPassword = (email, password) =>
  supabase.auth.signUp({ email, password });

export const signInWithEmailOtp = (email) =>
  supabase.auth.signInWithOtp({ email });

export const verifyEmailOtp = (email, token) =>
  supabase.auth.verifyOtp({ email, token, type: 'email' });

export const signInWithPhoneOtp = (phone) =>
  supabase.auth.signInWithOtp({ phone });

export const verifyPhoneOtp = (phone, token) =>
  supabase.auth.verifyOtp({ phone, token, type: 'sms' });

// Google/Apple aren't enabled providers on this project yet — this call is
// real (not simulated), so until they're enabled in the Supabase dashboard
// it resolves with a real "provider is not enabled" error rather than a
// fake success. Enabling the provider later needs no code change here.
export const signInWithOAuth = (provider) =>
  supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });

export const signOut = () => supabase.auth.signOut();
