// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.
// Note: internal state simulates a mock OTP/OAuth flow — do not wire anything real here.

import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, ChevronRight, Loader2, ShieldCheck, ArrowLeft, Lock, Eye, EyeOff, AlertTriangle, Smartphone, KeyRound, Check } from 'lucide-react';
import { ROLES } from '../../data/roles';
import { OTP_LENGTH, DEMO_CODE, CONSENT_ITEMS } from '../../data/auth';
import { Pill } from '../ui/Pill';
import { DhetArms, KhethaWordmark, SaStripe } from '../ui/BrandMarks';
import { LanguagePicker } from '../ui/LanguagePicker';
import { GoogleMark, AppleMark } from '../ui/SocialMarks';

/* ==================================================================
   A1 / A2: consent, secure sign-in, two-step verification
   ================================================================== */

export function AuthScreen({ onAuthenticated, role, onBack, t, lang, setLang }) {
  const [step, setStep] = useState("choose");
  const [method, setMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [trustDevice, setTrustDevice] = useState(true);
  const [consent, setConsent] = useState({ core: true, ncap: true, notify: true, research: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const boxes = useRef([]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);
  useEffect(() => {
    if (step === "verify") boxes.current[0]?.focus();
  }, [step]);

  const identity =
    method === "phone" ? `+27 ${phone}`
    : method === "email" ? email
    : method === "google" ? "learner@gmail.com"
    : "Apple ID";
  const channel =
    method === "phone" ? `SMS to +27 ${phone || "•• ••• ••••"}`
    : method === "email" ? `email to ${email || "your inbox"}`
    : "your authenticator app";

  const startVerification = (via) => {
    setError(""); setBusy(true);
    setTimeout(() => {
      setBusy(false); setMethod(via);
      setDigits(Array(OTP_LENGTH).fill("")); setResendIn(30); setStep("verify");
    }, 700);
  };

  const submitCredentials = () => {
    if (method === "email") {
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
      if (password.length < 6) return setError("Your password must be at least 6 characters.");
    }
    if (method === "phone") {
      const d = phone.replace(/\D/g, "");
      if (d.length !== 9) return setError("Enter 9 digits after +27, like 71 234 5678.");
      if (!/^[6-8]/.test(d)) return setError("South African mobile numbers start with 6, 7 or 8.");
    }
    startVerification(method);
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

  const verify = () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) return setError("Enter all six digits.");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (code === DEMO_CODE) setStep("consent");
      else {
        setError("That code doesn't match. Check your messages and try again.");
        setDigits(Array(OTP_LENGTH).fill("")); boxes.current[0]?.focus();
      }
    }, 600);
  };

  const back = () => {
    setError("");
    if (step === "verify") setStep(method === "google" || method === "apple" ? "choose" : "credentials");
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
          <button onClick={() => startVerification("google")} disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 k-dis-soft">
            <GoogleMark />{t("continueGoogle")}
          </button>
          <button onClick={() => startVerification("apple")} disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white k-dis-soft">
            <AppleMark />{t("continueApple")}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-medium text-slate-600">{t("or")}</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-2.5">
          <button onClick={() => { setMethod("email"); setError(""); setStep("credentials"); }}
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
          {method === "email" ? "Sign in with email" : "Sign in with your phone"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {method === "email"
            ? "Use the address you registered with. New here? The same form creates your account."
            : "Enter a South African mobile number. We'll SMS you a six-digit code."}
        </p>

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
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password}
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
            {busy ? "Sending code" : "Send verification code"}
          </button>
          {method === "email" && (
            <button className="w-full text-center text-xs font-semibold k-tx-005A36">Forgot your password?</button>
          )}
        </div>
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

        <div className="mt-5 space-y-2.5">
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

        <button
          onClick={() => onAuthenticated({ method, identity, trustDevice, consent, signedInAt: new Date() })}
          className="mt-5 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Agree and continue
        </button>
      </div>
    );
  }

  /* ---- two-step verification ---- */
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

      <button onClick={() => setTrustDevice((v) => !v)} className="mt-5 flex items-center gap-2.5 text-left">
        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
          trustDevice ? "k-bd-005A36 k-bg-005A36 text-white" : "border-slate-300 bg-white"
        }`}>
          {trustDevice && <Check className="h-3.5 w-3.5" />}
        </span>
        <span className="text-xs leading-relaxed text-slate-600">
          Trust this phone for 30 days. Only tick this on a device that is yours, not a shared or school computer.
        </span>
      </button>

      <button onClick={verify} disabled={busy || !complete}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white transition-colors k-dis">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Checking code" : "Verify and continue"}
      </button>
      <button onClick={() => setResendIn(30)} disabled={resendIn > 0}
        className="mt-3 w-full text-center text-xs font-semibold k-tx-005A36 k-dis-tx">
        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
      </button>
      <p className="mt-auto rounded-xl bg-slate-100 p-3 text-center text-[11px] leading-relaxed text-slate-600">
        Demo build — the code is {DEMO_CODE}.
      </p>
    </div>
  );
}
