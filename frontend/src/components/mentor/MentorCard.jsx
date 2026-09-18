// Rewritten against the real Mentor shape (backend/Models/Mentor.cs) — the mock
// version displayed studying/area/availability, none of which the real model
// collects. "Message" was removed from here entirely: the backend requires an
// accepted help request before messaging is allowed, so contact now only happens
// from an accepted row in "My requests" (see MentorHub), not from browsing.
import { Star } from 'lucide-react';
import { FIELD } from '../../data/fields';
import { MENTOR_ROLES } from '../../data/mentors';
import { Pill } from '../ui/Pill';
import { TierBadges } from '../ui/TierBadges';

export function MentorCard({ m, onRequest }) {
  const field = FIELD[m.field] || FIELD.stem;
  return (
    <article className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
      style={{ borderLeftColor: field.color }}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ background: field.color }}>
          {m.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{m.fullName}</h3>
          {m.institutionOrEmployer && <p className="mt-0.5 text-[11px] text-slate-600">{m.institutionOrEmployer}</p>}
          {m.province && <p className="mt-0.5 text-[11px] text-slate-600">{m.province}</p>}
        </div>
        {m.rating != null && (
          <div className="shrink-0 text-right">
            <p className="flex items-center gap-1 text-xs font-bold text-slate-900">
              <Star className="h-3.5 w-3.5 k-tx-D4AF37 fill-current" />{m.rating}
            </p>
            <p className="text-[10px] text-slate-600">{m.sessionsCompleted} sessions</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill tone="slate">{MENTOR_ROLES[m.role]?.label || m.role}</Pill>
        <TierBadges tiers={m.verificationTiers} />
        {(m.subjects || []).map((s) => <Pill key={s} tone="blue">{s}</Pill>)}
      </div>

      {m.bio && <p className="mt-3 text-xs leading-relaxed text-slate-600">{m.bio}</p>}

      <div className="mt-3 border-t border-slate-100 pt-3">
        <button onClick={() => onRequest(m)}
          className="w-full rounded-lg k-bg-005A36 py-2 text-[11px] font-semibold text-white">
          Send a help request
        </button>
      </div>
    </article>
  );
}
