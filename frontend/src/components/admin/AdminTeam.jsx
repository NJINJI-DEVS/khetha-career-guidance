// Who holds administrator rights, and the controls to change that.
//
// Granting admin lets someone approve an adult to meet learners, so this screen
// treats it as a serious act: it states what the rights include before the
// grant, names who granted each existing administrator, and keeps revoked
// administrators visible rather than deleting the record that they once held
// access.

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, ShieldOff, UserPlus, Loader2, AlertTriangle, Clock, Mail, X,
} from 'lucide-react';
import { listAdmins, grantAdmin, revokeAdmin } from '../../lib/api';
import { Pill } from '../ui/Pill';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const sinceDays = (iso) =>
  iso ? Math.floor((Date.now() - new Date(iso)) / 86400000) : null;

function GrantForm({ onClose, onGranted }) {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await grantAdmin(email.trim(), note.trim() || null);
      onGranted();
    } catch (err) {
      setError(err.body?.error || 'Could not grant administrator rights.');
      setBusy(false);
    }
  };

  const inputCls =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37';

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Add an administrator</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
            They must have signed in to Khetha at least once, so we can match the address to a real account.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="rounded-lg bg-slate-100 p-1.5 text-slate-700"><X className="h-4 w-4" /></button>
      </div>

      <div className="mt-3.5">
        <label htmlFor="grant-email" className="text-xs font-medium text-slate-700">Their email address</label>
        <input id="grant-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@department.gov.za" className={inputCls} />
      </div>

      <div className="mt-3">
        <label htmlFor="grant-note" className="text-xs font-medium text-slate-700">
          Why <span className="text-slate-500">(recorded in the audit log)</span>
        </label>
        <input id="grant-note" value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Provincial coordinator, Limpopo" className={inputCls} />
      </div>

      <div className="mt-3.5 rounded-xl k-bd-E4CE8A k-bg-FBF5E7 border p-3">
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 k-tx-6B5307" />
          An administrator can approve mentors and events, see every learner statistic, and grant these same rights
          to anyone else. There is one level of administrator — there is no view-only option.
        </p>
      </div>

      {error && <p className="mt-2.5 text-xs k-tx-9B1C14">{error}</p>}

      <button type="submit" disabled={busy || !email.trim()}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Grant administrator rights
      </button>
    </form>
  );
}

export function AdminTeam({ currentUserId }) {
  const [admins, setAdmins] = useState([]);
  const [status, setStatus] = useState('loading');
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    listAdmins()
      .then((d) => { setAdmins(d); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(load, [load]);

  const doRevoke = async (a) => {
    const note = window.prompt(`Why are you removing ${a.email}'s administrator access?`);
    if (note === null) return;
    setRevoking(a.userId); setError('');
    try {
      await revokeAdmin(a.userId, note);
      load();
    } catch (err) {
      setError(err.body?.error || 'Could not revoke those rights.');
    } finally {
      setRevoking(null);
    }
  };

  if (granting) {
    return <GrantForm onClose={() => setGranting(false)}
      onGranted={() => { setGranting(false); setStatus('loading'); load(); }} />;
  }

  const active = admins.filter((a) => a.isActive);
  const past = admins.filter((a) => !a.isActive);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">Administrator access</p>
        <p className="mt-0.5 text-lg font-semibold">
          {active.length} {active.length === 1 ? 'person has' : 'people have'} admin rights
        </p>
        <p className="mt-2 text-[11px] leading-relaxed k-tx-BFE5D4">
          Administrator rights are granted here and recorded in the audit log. They are never self-registered, and
          the last remaining administrator cannot be removed.
        </p>
      </div>

      <button onClick={() => setGranting(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed k-bd-00784A k-bg-E7F4EE p-4 text-left">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-005A36 text-white">
          <UserPlus className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold k-tx-005A36">Add an administrator</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">
            Grant rights to a colleague who already has a Khetha account.
          </span>
        </span>
      </button>

      {error && <p className="rounded-xl k-bg-FBEAE8 p-3 text-xs k-tx-9B1C14">{error}</p>}
      {status === 'loading' && (
        <p className="flex items-center gap-2 text-xs text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading administrators…
        </p>
      )}
      {status === 'error' && <p className="text-xs text-slate-600">Couldn't load the administrator list.</p>}

      <div className="grid gap-3 lg:grid-cols-2">
        {active.map((a) => {
          const dormant = sinceDays(a.lastSeenAt);
          const isMe = a.userId === currentUserId;
          return (
            <article key={a.userId} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" />{a.email || '(no address on file)'}
                  </p>
                  {a.displayName && <p className="text-[11px] text-slate-600">{a.displayName}</p>}
                  <p className="mt-1 text-[11px] text-slate-600">
                    Since {fmtDate(a.grantedAt)}
                    {a.grantedByEmail ? ` · granted by ${a.grantedByEmail}` : ''}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {isMe && <Pill tone="green">You</Pill>}
                {a.grantedVia === 'bootstrap' && <Pill tone="gold">First administrator</Pill>}
                {a.grantedVia === 'pre-existing' && <Pill tone="slate">Pre-dates the audit log</Pill>}
                {a.grantedVia === 'migrated' && <Pill tone="slate">Carried over from user roles</Pill>}
                {dormant != null && dormant > 60 && (
                  <Pill tone="red" icon={Clock}>Not seen in {dormant} days</Pill>
                )}
                {a.lastSeenAt == null && <Pill tone="slate" icon={Clock}>Never signed in here</Pill>}
              </div>

              {a.note && (
                <p className="mt-2 rounded-xl bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-700">{a.note}</p>
              )}

              {!isMe && (
                <button onClick={() => doRevoke(a)} disabled={revoking === a.userId || active.length <= 1}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl k-bg-B3261E py-2.5 text-xs font-semibold text-white k-dis">
                  {revoking === a.userId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
                  Remove administrator access
                </button>
              )}
              {isMe && (
                <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
                  You cannot remove your own access — another administrator has to do it, so nobody locks the
                  platform out by accident.
                </p>
              )}
            </article>
          );
        })}
      </div>

      {past.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-900">Previous administrators</p>
          <div className="space-y-2">
            {past.map((a) => (
              <div key={a.userId} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-900">{a.email}</p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Access removed {fmtDate(a.revokedAt)}{a.note ? ` — ${a.note}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
