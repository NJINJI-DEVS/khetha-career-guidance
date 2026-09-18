// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useMemo } from 'react';
import { Building2, ShieldCheck, CalendarClock, CheckCircle2, AlertTriangle, GraduationCap } from 'lucide-react';
import { KHETHA } from '../../theme/tokens';
import { SUBJECT_LABELS } from '../../data/subjects';
import { QUALIFICATIONS } from '../../data/qualifications';
import { TYPE_COLOR, providerById } from '../../data/providers';
import { eligibility } from '../../engines/subjects';
import { SearchBar } from '../ui/SearchBar';
import { Chips } from '../ui/Chips';
import { EmptyState } from '../ui/EmptyState';
import { FavouriteButton } from '../ui/FavouriteButton';
import { Pill } from '../ui/Pill';

export function QualificationsDirectory({ ctx, fav, toggleFav, onOpen }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [gateway, setGateway] = useState("any");
  const [onlyEligible, setOnlyEligible] = useState(false);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return QUALIFICATIONS
      .map((x) => ({ ...x, provider: providerById[x.providerId], ...eligibility(x, ctx) }))
      .filter((x) => (type === "all" ? true : x.provider.type === type))
      .filter((x) => (gateway === "any" ? true : gateway === "pure" ? x.pureMathsOnly : !x.pureMathsOnly))
      .filter((x) => (onlyEligible ? x.eligible : true))
      .filter((x) => !s || x.title.toLowerCase().includes(s) || x.provider.name.toLowerCase().includes(s))
      .sort((a, b) => Number(b.eligible) - Number(a.eligible));
  }, [q, type, gateway, onlyEligible, ctx]);

  return (
    <div className="space-y-3">
      <SearchBar value={q} onChange={setQ} placeholder="Search a qualification or institution" />
      <Chips value={type} onChange={setType} colorFor={(k) => TYPE_COLOR[k]}
        options={[{ key: "all", label: "All" }, { key: "university", label: "Universities" },
                  { key: "uot", label: "UoTs" }, { key: "tvet", label: "TVET" }, { key: "cet", label: "CET" }]} />
      <div className="flex flex-wrap items-center gap-2">
        {[{ key: "any", label: "Any maths" }, { key: "pure", label: "Pure Maths required" }, { key: "lit", label: "Maths Lit allowed" }].map((g) => (
          <button key={g.key} onClick={() => setGateway(g.key)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
              gateway === g.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}>{g.label}</button>
        ))}
        <button onClick={() => setOnlyEligible((v) => !v)}
          className={`ml-auto rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
            onlyEligible ? "k-bg-D4AF37 text-slate-900" : "bg-slate-100 text-slate-700"
          }`}>I qualify only</button>
      </div>
      <p className="text-xs text-slate-600">
        {results.length} qualifications · {results.filter((r) => r.eligible).length} you qualify for today
      </p>

      {results.map((c) => (
        <article key={c.id}
          className={`rounded-2xl border border-l-4 bg-white p-4 ${c.eligible ? "border-slate-200 ring-1 k-rg-00784A" : "border-slate-200"}`}
          style={{ borderLeftColor: TYPE_COLOR[c.provider.type] }}>
          <div className="flex items-start gap-3">
            <button onClick={() => onOpen(c.id)} className="flex-1 text-left">
              <h3 className="text-sm font-semibold leading-snug text-slate-900">{c.title}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                <Building2 className="h-3 w-3" />{c.provider.name}
              </p>
            </button>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="rounded-xl px-2.5 py-1.5 text-center"
                style={{ background: TYPE_COLOR[c.provider.type], color: c.provider.type === "uot" ? KHETHA.ink : "#fff" }}>
                <p className="text-[9px] leading-none opacity-80">APS</p>
                <p className="text-sm font-bold leading-tight">{c.minAPS}</p>
              </div>
              <FavouriteButton on={fav.includes(c.id)} onToggle={() => toggleFav(c.id)} label={c.title} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="slate">NQF {c.nqf}</Pill>
            <Pill tone="slate">{c.duration}</Pill>
            {c.pureMathsOnly && <Pill tone="gold">Pure Maths only</Pill>}
            {Object.entries(c.requires).map(([k, v]) => (
              <Pill key={k}>{`${SUBJECT_LABELS[k]} ≥ ${v}%`}</Pill>
            ))}
            {c.nsfas ? <Pill tone="green" icon={ShieldCheck}>NSFAS accredited</Pill> : <Pill tone="red">Self-funded</Pill>}
            <Pill tone="navy" icon={CalendarClock}>Closes {c.deadline}</Pill>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            {c.eligible ? (
              <p className="flex items-center gap-1.5 text-xs font-medium k-tx-005A36">
                <CheckCircle2 className="h-4 w-4" />You meet every requirement. Apply before {c.deadline}.
              </p>
            ) : (
              <p className="flex items-start gap-1.5 text-xs k-tx-6B5307">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Still needed: {c.unmet.join(" · ")}</span>
              </p>
            )}
          </div>
        </article>
      ))}
      {results.length === 0 && (
        <EmptyState icon={GraduationCap} title="Nothing matches those filters"
          body="Clear the search or switch back to All to widen the list." />
      )}
    </div>
  );
}
