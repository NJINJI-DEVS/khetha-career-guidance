// Administrator sign-in.
//
// Deliberately separate from AuthScreen. An administrator is not a role someone
// registers as — there is no sign-up, no role claim, no guardian consent and no
// NCAP data-sharing question, because none of those apply to a staff account.
// Mixing it into the learner flow is what produced the old "Platform
// Administrator" card that nobody could ever successfully use.
//
// Authorisation is checked against the server, not assumed from the sign-in:
// a valid Supabase account that is not in the admins table is signed straight
// back out. The client cannot promote itself.

import { useState } from 'react';
import { ShieldCheck, ArrowLeft, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { signInWithPassword, signOut } from '../../services/authService';
import { getMyAdmin } from '../../lib/api';
import { DEMO_ADMIN, demoAdminCredentials, isDemoAdminEnabled } from '../../data/demoAdmin';
import { DhetArms } from '../ui/BrandMarks';

export function AdminSignIn({ onBack, onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    setBusy(true);

    // The demo shortcut resolves to real credentials supplied by configuration.
    // It is a convenience for demonstrating the admin screens, not a second way
    // in: whatever it signs in as still has to be in the admins table.
    let creds = { email: email.trim(), password };
    if (isDemoAdminEnabled()
        && creds.email.toLowerCase() === DEMO_ADMIN.email
        && password === DEMO_ADMIN.password) {
      const real = demoAdminCredentials();
      if (!real) {
        setBusy(false);
        setError('Demo administrator is not configured on this build. Sign in with a real administrator account.');
        return;
      }
      creds = real;
    }

    const { error: authErr } = await signInWithPassword(creds.email, creds.password);
    if (authErr) {
      setBusy(false);
      setError(authErr.message || 'Those sign-in details were not accepted.');
      return;
    }

    // Signed in, but not yet known to be an administrator.
    try {
      const admin = await getMyAdmin();
      setBusy(false);
      onAuthenticated({
        method: 'email',
        identity: admin.email || creds.email,
        admin,
        isAdmin: true,
        trustDevice: false,
        consent: { core: true, ncap: false, notify: false, research: false },
        ageGate: { minor: false },
        signedInAt: new Date(),
      });
    } catch (err) {
      // Not an administrator. Do not leave them holding a session they did not
      // ask for — they came here to sign in as staff, not as a learner.
      await signOut().catch(() => {});
      setBusy(false);
      setError(err.status === 404
        ? 'That account is not an administrator. Ask an existing administrator to grant access.'
        : 'Could not confirm administrator access. Check your connection and try again.');
    }
  };

  const inputCls =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37';

  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
      <button onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
        <ArrowLeft className="h-4 w-4" />Back
      </button>

      <div className="mt-6 flex items-center gap-3">
        <DhetArms className="h-12" />
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">Administrator sign-in</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        For departmental staff who review mentor applications and approve events. Administrator access is granted by
        another administrator — it cannot be registered for here.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3.5">
        <div>
          <label htmlFor="admin-email" className="text-xs font-medium text-slate-700">Email address</label>
          <input id="admin-email" value={email} onChange={(ev) => setEmail(ev.target.value)}
            autoComplete="username" placeholder="you@department.gov.za" className={inputCls} />
        </div>

        <div>
          <label htmlFor="admin-pw" className="text-xs font-medium text-slate-700">Password</label>
          <div className="relative">
            <input id="admin-pw" type={showPw ? 'text' : 'password'} value={password}
              onChange={(ev) => setPassword(ev.target.value)} autoComplete="current-password"
              className={`${inputCls} pr-11`} />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 mt-0.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-1.5 rounded-xl k-bg-FBEAE8 p-3 text-xs leading-relaxed k-tx-9B1C14">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
          </p>
        )}

        <button type="submit" disabled={busy || !email.trim() || !password}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white k-dis">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? 'Checking access…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-auto pt-8 text-[11px] leading-relaxed text-slate-600">
        Every administrator action — approving a mentor, approving an event, granting access to another
        administrator — is recorded against your account in the audit log.
      </p>
    </div>
  );
}
