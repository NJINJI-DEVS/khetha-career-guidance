// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useMemo } from 'react';
import { BookOpen, BriefcaseBusiness, GraduationCap, Search, TrendingUp } from 'lucide-react';
import { OCCUPATIONS } from '../../data/occupations';
import { qualById } from '../../data/qualifications';
import { FIELD, FIELDS } from '../../data/fields';
import { SearchBar } from '../ui/SearchBar';
import { Chips } from '../ui/Chips';
import { EmptyState } from '../ui/EmptyState';
import { FavouriteButton } from '../ui/FavouriteButton';
import { Pill } from '../ui/Pill';

/* ==================================================================
   R4: Careers, What to study, Where to study — plus R8 advice
   ================================================================== */

export function CareersDirectory({ fav, toggleFav, onOpen, fieldFilter, setFieldFilter }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return OCCUPATIONS
      .filter((o) => (fieldFilter === "all" ? true : o.field === fieldFilter))
      .filter((o) => !s || o.title.toLowerCase().includes(s) || o.summary.toLowerCase().includes(s) || o.ofo.includes(s));
  }, [q, fieldFilter]);

  const qualificationType = (qualification) => {
    if (/^(Bachelor|BSc|BCom|BEd|BEng)\b/i.test(qualification.title)) return "Degree";
    if (/diploma/i.test(qualification.title)) return "Diploma";
    return "Certificate";
  };

  return (
    <div className="space-y-3">
      <SearchBar value={q} onChange={setQ} placeholder="Search a career, or an OFO code" />
      <Chips value={fieldFilter} onChange={setFieldFilter}
        colorFor={(k) => FIELD[k]?.color}
        options={[{ key: "all", label: "All fields" }, ...FIELDS.map((f) => ({ key: f.key, label: f.label }))]} />
      <p className="text-xs text-slate-600">{results.length} careers</p>
      {results.map((o) => (
        <article key={o.id} className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
          style={{ borderLeftColor: FIELD[o.field].color }}>
          <div className="flex items-start gap-3">
            <button onClick={() => onOpen(o.id)} className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-slate-900">{o.title}</h3>
              <p className="mt-0.5 text-[11px] text-slate-600">{FIELD[o.field].label} · OFO {o.ofo}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{o.summary}</p>
              <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3">
                <div className="flex gap-2.5">
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Required qualification</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-800">
                      {[...new Set(o.quals.map((id) => qualificationType(qualById[id])).filter(Boolean))].join(" or ")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Courses you can take</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-800">
                      {o.quals.map((id) => qualById[id]?.title).filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">What day-to-day looks like</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-800">{o.tasks.join(" · ")}</p>
                  </div>
                </div>
              </div>
            </button>
            <FavouriteButton on={fav.includes(o.id)} onToggle={() => toggleFav(o.id)} label={o.title} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone={o.demand === "Scarce skill" ? "red" : "slate"} icon={TrendingUp}>{o.demand}</Pill>
            <Pill tone="slate">{o.salary}</Pill>
          </div>
        </article>
      ))}
      {results.length === 0 && (
        <EmptyState icon={Search} title="No careers match that"
          body="Try a broader word, or clear the field filter to see all twelve." />
      )}
    </div>
  );
}
