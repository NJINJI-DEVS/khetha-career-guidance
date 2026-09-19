import { useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { signInWithPassword, signOut } from '../../services/authService';
import { getMyAdminAccount } from '../../lib/api';

export function AdminLogin({ onBack, onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { error: authError } = await signInWithPassword(email.trim(), password);
      if (authError) throw authError;
      const account = await getMyAdminAccount();
      if (account.role !== 'admin') throw new Error('This account does not have administrator access.');
      await onAuthenticated({ method: 'email', identity: email.trim(), signedInAt: new Date() });
    } catch (err) {
      await signOut();
      setError([403, 404].includes(err.status) ? 'This account does not have active administrator access.' : err.message);
    } finally { setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <button disabled={busy} onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" />Back</button>
      <ShieldCheck className="h-9 w-9 k-tx-005A36" />
      <div><h2 className="text-xl font-bold text-slate-900">Administrator login</h2>
        <p className="mt-2 text-sm text-slate-600">Sign in with your assigned administrator account to review mentor and tutor applications.</p></div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">Email address<input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-xl border p-3" /></label>
        <label className="block text-sm">Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-xl border p-3" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl k-bg-005A36 p-3 font-semibold text-white disabled:opacity-50">{busy ? 'Checking access…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
