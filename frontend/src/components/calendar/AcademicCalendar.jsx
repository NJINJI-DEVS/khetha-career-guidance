// The South African academic year: public holidays, school terms, exam windows
// and application deadlines, plus any mentor session approved for this learner.
//
// Built for a phone first. The month grid is the familiar shape, but the list
// underneath it is what most people actually read, so it is not an afterthought
// — on a small screen the grid is a picker and the list is the content.

import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays, Info, MapPin, Bell, AlertTriangle,
  ExternalLink, CalendarRange,
} from 'lucide-react';
import { calendarEvents, CATEGORIES, hasProvisional } from '../../data/saCalendar';
import { getMyRegisteredEvents } from '../../lib/api';
import { Pill } from '../ui/Pill';
import { SectionTitle } from '../ui/SectionTitle';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const TONE_COLOR = {
  red: '#B3261E', green: '#00784A', gold: '#D4AF37', blue: '#1E3A6E', slate: '#64748B',
};

// An accepted session is a commitment, not a deadline to be reminded about —
// the reminder bell is for things still to be acted on.
const NO_REMINDER = new Set(['holiday', 'mine']);

const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Monday-first weekday index, matching the DOW header and South African norm. */
const mondayIndex = (d) => (d.getDay() + 6) % 7;

function startOfWeek(d) {
  const s = new Date(d);
  s.setDate(s.getDate() - mondayIndex(s));
  s.setHours(0, 0, 0, 0);
  return s;
}

function EventRow({ e, today, onRemind }) {
  const cat = CATEGORIES[e.category] || CATEGORIES.deadline;
  const past = e.date < today;
  // Reminders only make sense for something you can still act on, and a public
  // holiday is not something to be reminded about.
  const remindable = !past && !NO_REMINDER.has(e.category) && !!onRemind;
  const d = new Date(`${e.date}T00:00:00`);
  return (
    <li className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 ${past ? 'opacity-55' : ''}`}>
      <span className="grid w-11 shrink-0 place-items-center rounded-xl py-1.5 text-white"
        style={{ backgroundColor: TONE_COLOR[cat.tone] }}>
        <span className="text-[10px] uppercase leading-none opacity-90">{MONTHS[d.getMonth()].slice(0, 3)}</span>
        <span className="text-base font-bold leading-tight tabular-nums">{d.getDate()}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{e.title}</p>
        {e.note && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{e.note}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Pill tone={cat.tone}>{cat.label.replace(/s$/, '')}</Pill>
          {e.region && <Pill tone="slate" icon={MapPin}>{e.region}</Pill>}
          {e.provisional && <Pill tone="gold" icon={AlertTriangle}>Check official date</Pill>}
          {e.link && (
            <a href={e.link} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold k-tx-005A36">
              Official page<ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      {remindable && (
        <button onClick={() => onRemind({ id: e.id, title: e.title, date: e.date, venue: e.note || '' })}
          aria-label={`Remind me about ${e.title}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          <Bell className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

export function AcademicCalendar({ learner, onRemind }) {
  const today = isoOf(new Date());
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [view, setView] = useState('month');           // month | week | list
  const [active, setActive] = useState(() => new Set(Object.keys(CATEGORIES)));
  const [selected, setSelected] = useState(today);
  const [mentorEvents, setMentorEvents] = useState([]);

  // Only sessions this learner has ACCEPTED. A calendar is a record of what you
  // are committed to, not a listing of everything on offer — invitations live in
  // the Invites screen, and accepting one is what moves it here.
  useEffect(() => {
    let live = true;
    getMyRegisteredEvents()
      .then((d) => { if (live) setMentorEvents(d); })
      .catch(() => {});
    return () => { live = false; };
  }, [learner?.province]);

  const year = cursor.getFullYear();

  const all = useMemo(() => {
    const base = calendarEvents(year);
    const fromMentors = mentorEvents.map((m) => ({
      id: `me-${m.id}`,
      date: m.startsAt.slice(0, 10),
      title: m.title,
      category: 'mine',
      note: `${m.isOnline ? 'Online' : m.venue} · hosted by ${m.mentorName}. ${m.impact || ''}`.trim(),
    }));
    return [...base, ...fromMentors].sort((a, b) => a.date.localeCompare(b.date));
  }, [year, mentorEvents]);

  const shown = useMemo(() => all.filter((e) => active.has(e.category)), [all, active]);
  const byDate = useMemo(() => {
    const m = new Map();
    for (const e of shown) {
      if (!m.has(e.date)) m.set(e.date, []);
      m.get(e.date).push(e);
    }
    return m;
  }, [shown]);

  const toggle = (key) =>
    setActive((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });

  /* ---- grid cells ------------------------------------------------- */
  const cells = useMemo(() => {
    if (view === 'week') {
      const s = startOfWeek(new Date(selected + 'T00:00:00'));
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(s); d.setDate(s.getDate() + i);
        return { iso: isoOf(d), day: d.getDate(), inMonth: true };
      });
    }
    const first = new Date(year, cursor.getMonth(), 1);
    const lead = mondayIndex(first);
    const days = new Date(year, cursor.getMonth() + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < lead; i += 1) {
      const d = new Date(year, cursor.getMonth(), -(lead - 1 - i));
      out.push({ iso: isoOf(d), day: d.getDate(), inMonth: false });
    }
    for (let i = 1; i <= days; i += 1) {
      out.push({ iso: isoOf(new Date(year, cursor.getMonth(), i)), day: i, inMonth: true });
    }
    // Pad to whole weeks so the grid does not change height month to month.
    while (out.length % 7 !== 0) {
      const d = new Date(year, cursor.getMonth() + 1, out.length % 7);
      out.push({ iso: isoOf(d), day: d.getDate(), inMonth: false });
    }
    return out;
  }, [view, selected, cursor, year]);

  const move = (delta) => {
    if (view === 'week') {
      const d = new Date(selected + 'T00:00:00');
      d.setDate(d.getDate() + delta * 7);
      setSelected(isoOf(d));
      setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
      return;
    }
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  const selectedEvents = byDate.get(selected) || [];
  const upcoming = shown.filter((e) => e.date >= today).slice(0, 12);
  const monthLabel = view === 'week'
    ? `Week of ${new Date(startOfWeek(new Date(selected + 'T00:00:00'))).getDate()} ${MONTHS[cursor.getMonth()]}`
    : `${MONTHS[cursor.getMonth()]} ${year}`;

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">South African academic year</p>
        <p className="mt-0.5 text-lg font-semibold">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed k-tx-BFE5D4">
          School terms, public holidays, exam windows and the application deadlines that decide whether you have a
          place next year.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.values(CATEGORIES).map((c) => {
          const on = active.has(c.key);
          return (
            <button key={c.key} onClick={() => toggle(c.key)} aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                on ? 'text-white' : 'bg-slate-100 text-slate-700'
              }`}
              style={on ? { backgroundColor: TONE_COLOR[c.tone] } : undefined}>
              <span className="h-2 w-2 rounded-full"
                style={{ backgroundColor: on ? 'rgba(255,255,255,.85)' : TONE_COLOR[c.tone] }} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* View switch */}
      <div className="grid grid-cols-3 gap-2">
        {[['month', 'Month', CalendarDays], ['week', 'Week', CalendarRange], ['list', 'What is coming', Bell]]
          .map(([k, l, Icon]) => (
            <button key={k} onClick={() => setView(k)} aria-pressed={view === k}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-colors ${
                view === k ? 'k-bg-005A36 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
              <Icon className="h-3.5 w-3.5" />{l}
            </button>
          ))}
      </div>

      {view !== 'list' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <button onClick={() => move(-1)} aria-label="Previous"
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-bold text-slate-900">{monthLabel}</p>
            <button onClick={() => move(1)} aria-label="Next"
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {DOW.map((d, i) => (
              <span key={i} className="pb-1 text-center text-[10px] font-semibold uppercase text-slate-500">{d}</span>
            ))}
            {cells.map((c) => {
              const evs = byDate.get(c.iso) || [];
              const isToday = c.iso === today;
              const isSel = c.iso === selected;
              return (
                <button key={c.iso} onClick={() => setSelected(c.iso)}
                  aria-label={`${c.iso}${evs.length ? `, ${evs.length} event${evs.length > 1 ? 's' : ''}` : ''}`}
                  aria-current={isToday ? 'date' : undefined}
                  className={`flex min-h-[44px] flex-col items-center justify-start rounded-lg py-1 text-[11px] transition-colors ${
                    isSel ? 'k-bg-005A36 text-white'
                      : isToday ? 'k-bg-E7F4EE k-tx-005A36 font-bold'
                      : c.inMonth ? 'text-slate-900 hover:bg-slate-100' : 'text-slate-400'
                  }`}>
                  <span className="tabular-nums">{c.day}</span>
                  <span className="mt-0.5 flex gap-0.5">
                    {evs.slice(0, 3).map((e) => (
                      <span key={e.id} className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: isSel ? '#fff' : TONE_COLOR[(CATEGORIES[e.category] || {}).tone] }} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view !== 'list' && (
        <div>
          <SectionTitle hint={selectedEvents.length ? `${selectedEvents.length} on this day` : undefined}>
            {new Date(selected + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </SectionTitle>
          {selectedEvents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-600">
              Nothing on this day.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {selectedEvents.map((e) => <EventRow key={e.id} e={e} today={today} onRemind={onRemind} />)}
            </ul>
          )}
        </div>
      )}

      <div>
        <SectionTitle hint="Next up">What is coming</SectionTitle>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-600">
            Nothing left this year in the categories you have selected.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {upcoming.map((e) => <EventRow key={e.id} e={e} today={today} onRemind={onRemind} />)}
          </ul>
        )}
      </div>

      {hasProvisional(shown) && (
        <div className="flex items-start gap-2.5 rounded-2xl k-bd-E4CE8A k-bg-FBF5E7 border p-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 k-tx-6B5307" />
          <p className="text-[11px] leading-relaxed text-slate-700">
            <span className="font-semibold k-tx-6B5307">Check the dates marked above. </span>
            Public holidays here are exact — they are set by the Public Holidays Act. School term dates and
            application deadlines are not: the department gazettes terms each year and institutions set their own
            closing dates. Confirm anything you are planning around with your school or the institution directly.
          </p>
        </div>
      )}
    </div>
  );
}
