// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { Phone, ShieldCheck, CalendarClock } from 'lucide-react';
import { KHETHA } from '../../theme/tokens';
import { OCCUPATIONS } from '../../data/occupations';
import { qualById } from '../../data/qualifications';
import { providerById, PROVIDER_TYPES } from '../../data/providers';
import { SUBJECT_LABELS } from '../../data/subjects';
import { eligibility } from '../../engines/subjects';
import { Screen } from '../ui/Screen';
import { FavouriteButton } from '../ui/FavouriteButton';
import { Pill } from '../ui/Pill';
import { SectionTitle } from '../ui/SectionTitle';

export function QualDetail({ id, onBack, ctx, fav, toggleFav }) {
  const q = qualById[id];
  const p = providerById[q.providerId];
  const { eligible, unmet } = eligibility(q, ctx);
  const leadsTo = OCCUPATIONS.filter((o) => o.quals.includes(q.id));
  return (
    <Screen onBack={onBack} title={q.title} subtitle={p.name}
      action={<FavouriteButton on={fav.includes(q.id)} onToggle={() => toggleFav(q.id)} label={q.title} />}>
      <div className={`rounded-2xl p-4 text-white`} style={{ background: eligible ? KHETHA.greenDeep : "#0F172A" }}>
        <p className="text-xs opacity-80">{eligible ? "You qualify" : "Not yet"}</p>
        <p className="mt-1 text-sm leading-relaxed">
          {eligible
            ? `Your marks meet every requirement. Applications close ${q.deadline}.`
            : `Still needed: ${unmet.join(" · ")}`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[{ l: "Minimum APS", v: q.minAPS }, { l: "NQF level", v: q.nqf }, { l: "Duration", v: q.duration }].map((s) => (
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
            <p className="text-sm font-bold text-slate-900">{s.v}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Subject requirements</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {q.pureMathsOnly && <Pill tone="gold">Pure Mathematics only</Pill>}
          {Object.entries(q.requires).map(([k, v]) => (
            <Pill key={k} tone={ctx.marks[k] >= v ? "green" : "red"}>
              {SUBJECT_LABELS[k]} ≥ {v}%
            </Pill>
          ))}
          {Object.keys(q.requires).length === 0 && <Pill tone="slate">No specific subject requirements</Pill>}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Funding and dates</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {q.nsfas ? <Pill tone="green" icon={ShieldCheck}>NSFAS accredited</Pill> : <Pill tone="red">Self-funded</Pill>}
          <Pill tone="navy" icon={CalendarClock}>Closes {q.deadline}</Pill>
        </div>
      </div>

      {leadsTo.length > 0 && (
        <>
          <SectionTitle>Careers this leads to</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {leadsTo.map((o) => <Pill key={o.id} tone="blue">{o.title}</Pill>)}
          </div>
        </>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">{p.name}</p>
        <p className="mt-0.5 text-[11px] text-slate-600">{p.city}, {p.province} · {PROVIDER_TYPES[p.type]}</p>
        <a href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
          <Phone className="h-3.5 w-3.5" />{p.phone}
        </a>
      </div>
    </Screen>
  );
}
