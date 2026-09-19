// Invitations to mentor-run sessions: seminars, work-shadowing days, site
// visits and talks, all of them already approved by an administrator.
//
// Accepting is what puts an event in a learner's own calendar, and it is a real
// commitment on both sides: the mentor set aside a fixed number of places, and
// a learner holding one is a place nobody else can take. So the screen shows
// what is left before they accept, says plainly what accepting means, and makes
// releasing a place easy — an unused seat that was never given back is the
// thing that makes a mentor stop offering days.

import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, MapPin, Users, Globe, Check, X, Loader2, Sparkles,
  Clock, CalendarCheck, Ticket, AlertTriangle,
} from 'lucide-react';
import {
  getUpcomingMentorEvents, acceptMentorEvent, cancelMentorEventPlace,
} from '../../lib/api';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';
import { SectionTitle } from '../ui/SectionTitle';

const KIND_LABEL = {
  seminar: 'Seminar',
  shadowing: 'Work shadowing',
  site_visit: 'Site visit',
  talk: 'Career talk',
};

const fmtWhen = (iso) =>
  new Date(iso).toLocaleString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });

const daysAway = (iso) => Math.ceil((new Date(iso) - Date.now()) / 86400000);

/** How places left should read. Scarcity is stated only when it is real. */
function slotsLabel(e) {
  if (e.slotsLeft == null) return null;
  if (e.slotsLeft === 0) return { tone: 'red', text: 'Full' };
  if (e.slotsLeft <= 3) return { tone: 'gold', text: `Only ${e.slotsLeft} place${e.slotsLeft === 1 ? '' : 's'} left` };
  return { tone: 'slate', text: `${e.slotsLeft} of ${e.capacity} places left` };
}

function EventCard({ e, onAccept, onCancel, busy }) {
  const slots = slotsLabel(e);
  const away = daysAway(e.startsAt);
  const blocked = e.isFull && !e.isRegistered;

  return (
    <article className={`rounded-2xl border bg-white p-4 ${
      e.isRegistered ? 'k-bd-00784A' : 'border-slate-200'
    }`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          e.isRegistered ? 'k-bg-005A36 text-white' : 'k-bg-E7F4EE k-tx-005A36'
        }`}>
          {e.isRegistered ? <CalendarCheck className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{e.title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-600">
            {KIND_LABEL[e.kind] || e.kind} · {e.mentorName}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="flex items-center gap-1.5 text-[11px] text-slate-700">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-500" />{fmtWhen(e.startsAt)}
        </p>
        <p className="flex items-start gap-1.5 text-[11px] text-slate-700">
          {e.isOnline
            ? <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
            : <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />}
          <span>{e.venue}</span>
        </p>
      </div>

      {e.impact && (
        <div className="mt-3 rounded-xl k-bg-E7F4EE p-3">
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-800">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 k-tx-005A36" />
            <span><span className="font-semibold">What you get out of it: </span>{e.impact}</span>
          </p>
        </div>
      )}

      {e.description && (
        <p className="mt-2.5 text-[11px] leading-relaxed text-slate-600">{e.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {e.isRegistered && <Pill tone="green" icon={Check}>You are going</Pill>}
        {slots && !e.isRegistered && <Pill tone={slots.tone} icon={Ticket}>{slots.text}</Pill>}
        {away <= 7 && <Pill tone="gold" icon={Clock}>{away <= 0 ? 'Today' : `In ${away} days`}</Pill>}
        {!e.isOnline && e.province && <Pill tone="slate">{e.province}</Pill>}
      </div>

      {e.isRegistered ? (
        <>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            This is in your calendar. If you can no longer go, release your place so another learner can take it.
          </p>
          <button onClick={() => onCancel(e)} disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 k-dis">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Release my place
          </button>
        </>
      ) : (
        <button onClick={() => onAccept(e)} disabled={busy || blocked}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {blocked ? 'This event is full' : 'Accept and add to my calendar'}
        </button>
      )}
    </article>
  );
}

export function EventInvites({ learner, go, isGuest }) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    // A guest holds no session, so this endpoint would refuse them. Saying so
    // is better than reporting a connection problem they cannot fix -- and
    // accepting a place needs an account anyway, since the mentor has to know
    // who is coming.
    if (isGuest) { setStatus('guest'); return; }
    getUpcomingMentorEvents({ province: learner?.province, days: 180 })
      .then((d) => { setEvents(d); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [learner?.province, isGuest]);

  useEffect(load, [load]);

  const act = async (e, fn) => {
    setBusyId(e.id); setError('');
    try {
      const updated = await fn(e.id);
      // The server returns the event with fresh counts, so the card reflects
      // the place that was just taken or freed without another round trip.
      setEvents((list) => list.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      setError(err.body?.error || 'That did not go through. Try again in a moment.');
      load(); // Almost always "someone took the last place" — show the truth.
    } finally {
      setBusyId(null);
    }
  };

  const going = events.filter((e) => e.isRegistered);
  const open = events.filter((e) => !e.isRegistered);

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">Invitations</p>
        <p className="mt-0.5 text-lg font-semibold">
          {going.length > 0
            ? `You are going to ${going.length} ${going.length === 1 ? 'session' : 'sessions'}`
            : 'Sessions you can join'}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed k-tx-BFE5D4">
          Seminars, work-shadowing days and site visits run by verified mentors. Every one has been checked by the
          department before it appears here.
        </p>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 rounded-xl k-bg-FBEAE8 p-3 text-xs leading-relaxed k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}

      {status === 'loading' && (
        <p className="flex items-center gap-2 text-xs text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading invitations…
        </p>
      )}
      {status === 'error' && (
        <p className="text-xs text-slate-600">Couldn't load invitations right now. Check your connection.</p>
      )}

      {status === 'guest' && (
        <EmptyState icon={CalendarDays} title="Create an account to accept invitations"
          body="Mentors set aside a fixed number of places, so they need to know who is coming. Browsing is free, but a place is held in your name."
          cta="Create an account" onCta={() => go('tab:me')} />
      )}

      {status === 'ready' && going.length > 0 && (
        <div>
          <SectionTitle hint="In your calendar">You are going</SectionTitle>
          <div className="grid gap-3 lg:grid-cols-2">
            {going.map((e) => (
              <EventCard key={e.id} e={e} busy={busyId === e.id}
                onAccept={(x) => act(x, acceptMentorEvent)}
                onCancel={(x) => act(x, cancelMentorEventPlace)} />
            ))}
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div>
          {going.length > 0 && <SectionTitle hint={`${open.length} open`}>Also on offer</SectionTitle>}
          {open.length === 0 ? (
            going.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No invitations yet"
                body="When a verified mentor runs a seminar or a work-shadowing day near you, it appears here for you to accept."
                cta="Find a mentor" onCta={() => go('tab:mentors')} />
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-600">
                Nothing else on offer near you right now.
              </p>
            )
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {open.map((e) => (
                <EventCard key={e.id} e={e} busy={busyId === e.id}
                  onAccept={(x) => act(x, acceptMentorEvent)}
                  onCancel={(x) => act(x, cancelMentorEventPlace)} />
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'ready' && events.length > 0 && (
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600">
          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          When you accept, the mentor sees your name, grade and province so they can plan the day. Nothing else from
          your profile is shared.
        </p>
      )}
    </div>
  );
}
