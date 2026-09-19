// Who is coming to one of the mentor's own sessions.
//
// This is a list of named minors with their grade and province, so it is shown
// only to the mentor hosting the day and to administrators — the server
// enforces that, this screen just presents it. It exists because a mentor
// planning a site visit needs to know how many to expect and what grade they
// are in, and because a cancelled place should be visibly released rather than
// silently vanish.

import { useState, useEffect } from 'react';
import {
  ArrowLeft, Users, Loader2, CheckCircle2, XCircle, CalendarDays, MapPin, Globe,
} from 'lucide-react';
import { getEventAttendees } from '../../lib/api';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';
import { Screen } from '../ui/Screen';

export function EventRegister({ event, onBack }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let live = true;
    getEventAttendees(event.id)
      .then((d) => { if (live) { setRows(d); setStatus('ready'); } })
      .catch(() => { if (live) setStatus('error'); });
    return () => { live = false; };
  }, [event.id]);

  const going = rows.filter((r) => r.status === 'going');
  const cancelled = rows.filter((r) => r.status === 'cancelled');

  return (
    <Screen onBack={onBack} title={event.title} subtitle="Who is coming">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-1.5 text-[11px] text-slate-700">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          {new Date(event.startsAt).toLocaleString('en-ZA', {
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
          })}
        </p>
        <p className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-700">
          {event.isOnline
            ? <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
            : <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />}
          {event.venue}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { l: 'Coming', v: going.length },
          { l: 'Places', v: event.capacity ?? '—' },
          { l: 'Still free', v: event.capacity != null ? Math.max(0, event.capacity - going.length) : '—' },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-slate-900">{s.v}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{s.l}</p>
          </div>
        ))}
      </div>

      {status === 'loading' && (
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading the register…
        </p>
      )}
      {status === 'error' && <p className="mt-4 text-xs text-slate-600">Couldn't load the register right now.</p>}

      {status === 'ready' && going.length === 0 && (
        <div className="mt-4">
          <EmptyState icon={Users} title="Nobody has accepted yet"
            body="Learners in your province see this session in their invitations. Places fill up closer to the day." />
        </div>
      )}

      {going.length > 0 && (
        <ul className="mt-4 space-y-2">
          {going.map((r) => (
            <li key={r.learnerUserId}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900">{r.learnerName}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {r.learnerGrade && <Pill tone="slate">{r.learnerGrade}</Pill>}
                  {r.learnerProvince && <Pill tone="slate">{r.learnerProvince}</Pill>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cancelled.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-slate-900">Released their place</p>
          <ul className="space-y-2">
            {cancelled.map((r) => (
              <li key={r.learnerUserId}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 opacity-70">
                <XCircle className="h-4 w-4 shrink-0 text-slate-500" />
                <p className="truncate text-xs text-slate-700">{r.learnerName}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            Those places went back into the pool, so another learner could take them.
          </p>
        </div>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-slate-600">
        You see a learner's name, grade and province because you need them to plan the day. Nothing else from their
        profile — marks, assessment results, saved careers — is shared with you.
      </p>
    </Screen>
  );
}
