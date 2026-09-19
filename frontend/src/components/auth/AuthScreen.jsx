// Wired to real Supabase Auth. Preserves the original step machine
// (choose -> credentials -> [verify for OTP methods] -> consent) and the
// onAuthenticated(sessionLikeObject) contract, so nothing downstream of
// this component needed to change.
//
// Email + password and email OTP need zero extra Supabase configuration —
// both are built into Supabase's core email auth. Google/Apple OAuth and
// phone/SMS OTP call the real Supabase APIs too, but will surface a real
// "provider not enabled" error until those providers are turned on in the
// Supabase dashboard (Authentication -> Providers) — nothing here is faked.

import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, ChevronRight, Loader2, ShieldCheck, ArrowLeft, Lock, Eye, EyeOff, AlertTriangle, Smartphone, KeyRound, Check, MailCheck } from 'lucide-react';
import { ROLES } from '../../data/roles';
import { OTP_LENGTH, CONSENT_ITEMS } from '../../data/auth';
import { Pill } from '../ui/Pill';
import { DhetArms, KhethaWordmark, SaStripe } from '../ui/BrandMarks';
import { LanguagePicker } from '../ui/LanguagePicker';
import { GoogleMark, AppleMark } from '../ui/SocialMarks';
import { GuardianConsent } from './GuardianConsent';
import {
  signInWithPassword, signUpWithPassword, signInWithEmailOtp, verifyEmailOtp,
  signInWithPhoneOtp, verifyPhoneOtp, signInWithOAuth,
} from '../../services/authService';
import { getMyConsent, saveMyConsent } from '../../lib/api';

/* ==================================================================
   A1 / A2: consent, secure sign-in, two-step verification
   ================================================================== */

export function AuthScreen({ onAuthenticated, role, onBack, t, lang, setLang, onGuest }) {
  const [step, setStep] = useState("choose");
  const [method, setMethod] = useState(null);
  const [mode, setMode] = useState("signin"); // email method only: "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [consent, setConsent] = useState({ core: true, notify: true, research: false });
  const [ageGate, setAgeGate] = useState(null);   /* {minor, guardian?} — POPIA gate, see GuardianConsent */
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [pendingAuth, setPendingAuth] = useState(null); // holds {method, identity} once Supabase auth succeeds, before consent
  const [savingConsent, setSavingConsent] = useState(false);

  // Only learners are asked their age. POPIA's protection for a child's
  // personal information is what the question exists for, and it applies to
  // the learners using this service - a mentor, professional or departmental
  // administrator holds an adult account by the nature of the role, so asking
  // them is a question with no consequence attached to either answer.
  const needsAgeGate = role === "student";

  /**
   * Called the moment Supabase accepts the credentials.
   *
   * Consent belongs to creating an account, not to signing in. Someone who
   * already has an account is never stopped on their way in - not when the
   * server has their consent on file, and not when it does not. The only
   * screen that ever shows it is the one where the account is being made.
   *
   * That last part matters for the accounts that already existed before
   * consent was recorded at all: gating them would mean every returning user
   * hits a privacy form on a login they have done twenty times. Their choices
   * are captured in Settings instead, where the privacy panel says nothing is
   * on file yet and the toggles write it.
   *
   * `isNewAccount` is passed in rather than inferred here, because only the
   * caller knows how the account arrived: an explicit sign-up, or a first-ever
   * OAuth/one-time-code sign-in where Supabase created the user on the spot.
   */
  const afterAuth = async (auth, { isNewAccount = false } = {}) => {
    setPendingAuth(auth);

    const enter = (consentRecord) => onAuthenticated({
      ...auth,
      consent: consentRecord
        ? { core: consentRecord.core, notify: consentRecord.notify,
            research: consentRecord.research }
        : { core: true, notify: false, research: false },
      ageGate: consentRecord
        ? { minor: consentRecord.isMinor,
            // Restored from the record so a learner who signs up, leaves, and
            // returns before finishing onboarding still has a date of birth.
            dateOfBirth: consentRecord.dateOfBirth ?? null,
            guardian: consentRecord.guardianName
              ? { name: consentRecord.guardianName, relation: consentRecord.guardianRelation,
                  contact: consentRecord.guardianContact }
              : undefined }
        : { minor: false },
      // Tells the app whether a consent record exists, so Settings can ask for
      // one without any of this interrupting the login.
      consentOnFile: !!consentRecord,
      signedInAt: new Date(),
    });

    // A brand new account cannot have consent on file, so there is nothing to
    // look up - go straight to the one screen that asks.
    if (isNewAccount) { setStep("consent"); return; }

    try {
      enter(await getMyConsent());
    } catch {
      // No record, or the lookup failed (offline). Either way this is an
      // existing account signing in, and it is let through. Defaults are the
      // cautious ones: nothing optional is assumed to have been agreed to.
      enter(null);
    }
  };
  const boxes = useRef([]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);
  useEffect(() => {
    if (step === "verify") boxes.current[0]?.focus();
  }, [step]);

  const identity = method === "phone" ? `+27 ${phone}` : email;
  const channel = method === "phone" ? `SMS to +27 ${phone || "•• ••• ••••"}` : `email to ${email || "your inbox"}`;

  const friendlyError = (err) => {
    const msg = err?.message || "Something went wrong. Please try again.";
    if (/provider is not enabled/i.test(msg)) {
      return `${method === "google" ? "Google" : method === "apple" ? "Apple" : "This"} sign-in isn't set up for this project yet — email is available in the meantime.`;
    }
    return msg;
  };

  /* ---- Google / Apple: real OAuth call, redirects the browser away ---- */
  const startOAuth = async (provider) => {
    setError(""); setBusy(true);
    const { error: err } = await signInWithOAuth(provider);
    setBusy(false);
    // On success the browser navigates away immediately — this line only
    // runs if the call failed before a redirect could happen.
    if (err) { setMethod(provider); setError(friendlyError(err)); }
  };

  /* ---- email / phone credentials submit ---- */
  const submitCredentials = async () => {
    setError("");
    if (method === "email") {
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
      if (mode === "signup" && password.length < 6) return setError("Your password must be at least 6 characters.");

      setBusy(true);
      const { data, error: err } = mode === "signup"
        ? await signUpWithPassword(email, password, role)
        : await signInWithPassword(email, password);
      setBusy(false);

      if (err) return setError(err.message);
      if (mode === "signup" && data.user && !data.session) {
        // Email confirmation is required before a session is issued.
        setStep("confirmEmail");
        return;
      }
      await afterAuth({ method: "email", identity: email }, { isNewAccount: mode === "signup" });
      return;
    }

    if (method === "phone") {
      const d = phone.replace(/\D/g, "");
      if (d.length !== 9) return setError("Enter 9 digits after +27, like 71 234 5678.");
      if (!/^[6-8]/.test(d)) return setError("South African mobile numbers start with 6, 7 or 8.");

      setBusy(true);
      const { error: err } = await signInWithPhoneOtp(`+27${d}`, role);
      setBusy(false);
      if (err) return setError(friendlyError(err));
      setDigits(Array(OTP_LENGTH).fill("")); setResendIn(30); setStep("verify");
      return;
    }
  };

  /* ---- email OTP: sent from the "choose" screen's "continue with email code" path ---- */
  const startEmailOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address first.");
    setError(""); setBusy(true);
    const { error: err } = await signInWithEmailOtp(email, role);
    setBusy(false);
    if (err) return setError(friendlyError(err));
    setMethod("emailOtp");
    setDigits(Array(OTP_LENGTH).fill("")); setResendIn(30); setStep("verify");
  };

  const setDigit = (i, raw) => {
    const v = raw.replace(/\D/g, "").slice(-1);
    setError("");
    setDigits((d) => { const n = [...d]; n[i] = v; return n; });
    if (v && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus();
  };
  const onOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      boxes.current[i - 1]?.focus();
      setDigits((d) => { const n = [...d]; n[i - 1] = ""; return n; });
    }
  };
  const onOtpPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    setDigits(Array(OTP_LENGTH).fill("").map((_, i) => text[i] || ""));
    boxes.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const verify = async () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) return setError("Enter all six digits.");
    setBusy(true);
    const d = phone.replace(/\D/g, "");
    const { error: err } = method === "phone"
      ? await verifyPhoneOtp(`+27${d}`, code)
      : await verifyEmailOtp(email, code);
    setBusy(false);

    if (err) {
      setError("That code doesn't match. Check your messages and try again.");
      setDigits(Array(OTP_LENGTH).fill("")); boxes.current[0]?.focus();
      return;
    }
    const created = data?.user?.created_at ? new Date(data.user.created_at) : null;
    const justCreated = !!created && (Date.now() - created.getTime()) < 120000;
    await afterAuth({ method, identity }, { isNewAccount: justCreated });
  };

  /**
   * Records consent server-side, then continues. Persisting BEFORE entering the
   * app is deliberate: if the write fails, the person has not been let in on an
   * agreement nobody kept a record of.
   */
  const submitConsent = async () => {
    setError("");
    setSavingConsent(true);
    const gate = ageGate || { minor: false };
    try {
      await saveMyConsent({
        core: true,
        notify: !!consent.notify,
        research: !!consent.research,
        isMinor: !!gate.minor,
        dateOfBirth: gate.dateOfBirth ?? null,
        guardianName: gate.guardian?.name ?? null,
        guardianRelation: gate.guardian?.relation ?? null,
        guardianContact: gate.guardian?.contact ?? null,
      });
      onAuthenticated({
        ...pendingAuth, consent, ageGate: gate,
        consentOnFile: true, signedInAt: new Date(),
      });
    } catch (err) {
      setError(err.body?.error || "Could not save your choices. Check your connection and try again.");
      setSavingConsent(false);
    }
  };

  const back = () => {
    setError("");
    if (step === "verify") setStep(method === "phone" ? "credentials" : "choose");
    else if (step === "confirmEmail") setStep("credentials");
    else setStep("choose");
  };

  const field = "w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37";

  /* ---- method picker ---- */
  if (step === "choose") {
    return (
      <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
        <div className="flex items-center gap-3">
          <DhetArms className="h-14" />
          <div className="leading-none">
            <p className="text-[15px] font-semibold lowercase leading-tight tracking-tight text-slate-900">
              higher education<br />&amp; training
            </p>
            <p className="mt-1.5 border-t border-slate-300 pt-1.5 text-[9px] leading-tight text-slate-600">
              Department of Higher Education and Training<br />
              <span className="font-semibold text-slate-800">REPUBLIC OF SOUTH AFRICA</span>
            </p>
          </div>
        </div>
        <div className="mt-5 flex h-1 w-24 overflow-hidden rounded-full">
          <span className="flex-1 k-bg-00784A" /><span className="flex-1 k-bg-D4AF37" />
          <span className="flex-1 k-bg-1E3A6E" /><span className="flex-1 k-bg-B3261E" />
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">{t("signInTitle")}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {role && ROLES[role]?.verifies ? t("signInSubVerify") : t("signInSub")}
        </p>
        {role && (
          <button onClick={onBack}
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200">
            <ArrowLeft className="h-3.5 w-3.5" />{t("joiningAs")} {t(ROLES[role].labelKey)}
          </button>
        )}

        <div className="mt-4">
          <LanguagePicker t={t} lang={lang} setLang={setLang} compact />
        </div>

        <div className="mt-6 space-y-2.5">
          <button onClick={() => startOAuth("google")} disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 k-dis-soft">
            <GoogleMark />{t("continueGoogle")}
          </button>
          <button onClick={() => startOAuth("apple")} disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white k-dis-soft">
            <AppleMark />{t("continueApple")}
          </button>
        </div>

        {error && (method === "google" || method === "apple") && (
          <p className="mt-3 flex items-start gap-1.5 text-xs k-tx-9B1C14">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
          </p>
        )}

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-medium text-slate-600">{t("or")}</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-2.5">
          <button onClick={() => { setMethod("email"); setMode("signin"); setError(""); setStep("credentials"); }}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
            <Mail className="h-5 w-5 k-tx-00784A" />
            <span className="flex-1 text-sm font-semibold text-slate-800">{t("continueEmail")}</span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
          <button onClick={() => { setMethod("phone"); setError(""); setStep("credentials"); }}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
            <Phone className="h-5 w-5 k-tx-00784A" />
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-800">{t("continuePhone")}</span>
              <span className="block text-[11px] text-slate-600">Works without data — we send an SMS</span>
            </span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {busy && (
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />Opening secure sign-in
          </p>
        )}

        {onGuest && role === "student" && (
          <button onClick={onGuest}
            className="mt-4 w-full rounded-xl border border-dashed border-slate-300 bg-white py-3 text-xs font-semibold text-slate-900">
            Look around first — no account needed
          </button>
        )}

        <div className="mt-auto pt-8">
          <p className="flex items-start gap-2 rounded-xl k-bg-E7F4EE p-3 text-[11px] leading-relaxed k-tx-005A36">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            {t("twoStepNote")}
          </p>
          <div className="mt-5 flex flex-col items-center gap-1.5">
            <KhethaWordmark className="h-8" />
            <p className="text-center text-[11px] leading-relaxed text-slate-600">
              {t("popiaNote")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---- credentials ---- */
  if (step === "credentials") {
    return (
      <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
        <button onClick={back}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
        <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
          {method === "email" ? (mode === "signup" ? "Create your account" : "Sign in with email") : "Sign in with your phone"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {method === "email"
            ? "Use the address you registered with, or create a new account below."
            : "Enter a South African mobile number. We'll SMS you a six-digit code."}
        </p>

        {method === "email" && (
          <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
            {[["signin", "Sign in"], ["signup", "Create account"]].map(([key, label]) => (
              <button key={key} onClick={() => { setMode(key); setError(""); }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                  mode === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}>{label}</button>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {method === "email" ? (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="email" inputMode="email" autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.co.za" className={field} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && submitCredentials()}
                  placeholder="Password" className={`${field} pr-11`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-stretch gap-2">
              <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <SaStripe />+27
              </span>
              <input type="tel" inputMode="numeric" autoComplete="tel-national" value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/[^\d ]/g, "").slice(0, 12)); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && submitCredentials()}
                placeholder="71 234 5678"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
            </div>
          )}

          {error && (
            <p className="flex items-start gap-1.5 text-xs k-tx-9B1C14">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
            </p>
          )}

          <button onClick={submitCredentials} disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white transition-colors k-dis">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy
              ? (method === "phone" ? "Sending code" : mode === "signup" ? "Creating account" : "Signing in")
              : (method === "phone" ? "Send verification code" : mode === "signup" ? "Create account" : "Sign in")}
          </button>

          {method === "email" && mode === "signin" && (
            <button onClick={startEmailOtp} disabled={busy}
              className="w-full text-center text-xs font-semibold k-tx-005A36">
              Or email me a one-time code instead
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---- signup issued, but Supabase requires email confirmation first ---- */
  if (step === "confirmEmail") {
    return (
      <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
        <button onClick={back}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
        <span className="mt-5 grid h-12 w-12 place-items-center rounded-2xl k-bg-E7F4EE k-tx-005A36">
          <MailCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">Check your email</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          We sent a confirmation link to <span className="font-semibold text-slate-900">{email}</span>. Open it, then
          come back here and sign in.
        </p>
        <button onClick={() => { setMode("signin"); setStep("credentials"); }}
          className="mt-6 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Back to sign in
        </button>
      </div>
    );
  }

  /* ---- consent (A2) ---- */
  if (step === "consent") {
    return (
      <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl k-bg-E7F4EE k-tx-005A36">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">What may Khetha keep?</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          You decide before anything is stored. Only the first item is needed for the app to work, and you can change
          the rest whenever you like.
        </p>

        {needsAgeGate ? (
          <div className="mt-5">
            <GuardianConsent onDone={setAgeGate} onDefer={() => setStep("choose")} />
          </div>
        ) : null}

        <div className="mt-3 space-y-2.5">
          {CONSENT_ITEMS.map((c) => {
            const on = consent[c.key];
            return (
              <button key={c.key} disabled={c.required}
                onClick={() => setConsent((s) => ({ ...s, [c.key]: !s[c.key] }))}
                className={`flex w-full gap-3 rounded-xl border p-3 text-left transition-colors ${
                  on ? "k-bd-00784A k-bg-E7F4EE" : "border-slate-200 bg-white"
                } ${c.required ? "cursor-default" : ""}`}>
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                  on ? "k-bd-005A36 k-bg-005A36 text-white" : "border-slate-300 bg-white"
                }`}>
                  {on && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {c.label}
                    {c.required && <Pill tone="slate">Required</Pill>}
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-slate-600">{c.body}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 rounded-xl bg-slate-100 p-3 text-[11px] leading-relaxed text-slate-600">
          Your data is encrypted in transit and at rest, stored in South Africa, and never sold. You can export or
          delete everything from Settings at any time.
        </p>

        {error && (
          <p className="mt-3 rounded-xl k-bg-FBEAE8 p-3 text-xs leading-relaxed k-tx-9B1C14">{error}</p>
        )}

        <button
          onClick={submitConsent}
          disabled={savingConsent || (needsAgeGate && !ageGate)}
          className="mt-5 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
          {savingConsent ? "Saving\u2026" : "Agree and continue"}
        </button>
        {needsAgeGate && !ageGate && (
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Answer how old you are first — under-18s need a guardian named before anything is stored.
          </p>
        )}
        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-600">
          You are asked this once. Next time you sign in, these choices are already on file — change them any time in
          Settings.
        </p>
      </div>
    );
  }

  /* ---- two-step verification (email/phone OTP only) ---- */
  const complete = digits.every(Boolean);
  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
      <button onClick={back}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
        <ArrowLeft className="h-4 w-4" />Back
      </button>
      <span className="mt-5 grid h-12 w-12 place-items-center rounded-2xl k-bg-D4AF37 text-slate-900">
        {method === "phone" ? <Smartphone className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
      </span>
      <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">Step 2 of 2: confirm it's you</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        We sent a six-digit code by {channel}. It expires in 10 minutes.
      </p>

      <div className="mt-6 flex justify-between gap-2" onPaste={onOtpPaste}>
        {digits.map((d, i) => (
          <input key={i} ref={(el) => (boxes.current[i] = el)} value={d}
            onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onOtpKeyDown(i, e)}
            inputMode="numeric" autoComplete="one-time-code" maxLength={1} aria-label={`Digit ${i + 1}`}
            className={`w-full rounded-xl border-2 bg-white py-3 text-center text-lg font-bold tabular-nums text-slate-900 focus:outline-none focus-visible:ring-2 k-fvr-D4AF37 ${
              error ? "k-bd-E5A79F" : d ? "k-bd-00784A" : "border-slate-200"
            }`} />
        ))}
      </div>

      {error && (
        <p className="mt-3 flex items-start gap-1.5 text-xs k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}

      <button onClick={verify} disabled={busy || !complete}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white transition-colors k-dis">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Checking code" : "Verify and continue"}
      </button>
      <button onClick={() => (method === "phone" ? submitCredentials() : startEmailOtp())} disabled={resendIn > 0}
        className="mt-3 w-full text-center text-xs font-semibold k-tx-005A36 k-dis-tx">
        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
      </button>
    </div>
  );
}
