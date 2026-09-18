// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { MapPin, Star, CalendarClock } from 'lucide-react';
import { FIELD } from '../../data/fields';
import { MENTOR_ROLES } from '../../data/mentors';
import { Pill } from '../ui/Pill';
import { VerificationBadge } from '../ui/VerificationBadge';

export function MentorCard({ m, onRequest, onOpen }) {
  return (
    <article className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
      style={{ borderLeftColor: FIELD[m.field].color }}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ background: FIELD[m.field].color }}>
          {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{m.name}</h3>
          <p className="mt-0.5 text-[11px] text-slate-600">{m.studying}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
            <MapPin className="h-3 w-3" />{m.area}, {m.province}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="flex items-center gap-1 text-xs font-bold text-slate-900">
            <Star className="h-3.5 w-3.5 k-tx-D4AF37 fill-current" />{m.rating}
          </p>
          <p className="text-[10px] text-slate-600">{m.sessions} sessions</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill tone="slate">{MENTOR_ROLES[m.role].label}</Pill>
        <VerificationBadge mentor={m} />
        {m.subjects.map((s) => <Pill key={s} tone="blue">{s}</Pill>)}
        <Pill tone="slate" icon={CalendarClock}>{m.availability}</Pill>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">{m.bio}</p>

      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
        <button onClick={() => onRequest(m)}
          className="flex-1 rounded-lg k-bg-005A36 py-2 text-[11px] font-semibold text-white">
          Send a help request
        </button>
        <button onClick={() => onOpen(m)}
          className="flex-1 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
          Message
        </button>
      </div>
    </article>
  );
}
