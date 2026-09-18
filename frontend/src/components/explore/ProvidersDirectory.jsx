// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useMemo } from 'react';
import { MapPin, ShieldCheck, Phone, Compass } from 'lucide-react';
import { PROVIDER_TYPES, TYPE_COLOR, PROVIDERS } from '../../data/providers';
import { QUALIFICATIONS } from '../../data/qualifications';
import { SearchBar } from '../ui/SearchBar';
import { Chips } from '../ui/Chips';
import { FavouriteButton } from '../ui/FavouriteButton';
import { Pill } from '../ui/Pill';

export const PROVINCES = ["All", "Gauteng", "KwaZulu-Natal", "Western Cape", "National"];

export function ProvidersDirectory({ fav, toggleFav }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [province, setProvince] = useState("All");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return PROVIDERS
      .filter((p) => (type === "all" ? true : p.type === type))
      .filter((p) => (province === "All" ? true : p.province === province))
      .filter((p) => !s || p.name.toLowerCase().includes(s) || p.city.toLowerCase().includes(s));
  }, [q, type, province]);

  return (
    <div className="space-y-3">
      <SearchBar value={q} onChange={setQ} placeholder="Search an institution or town" />
      <Chips value={type} onChange={setType} colorFor={(k) => TYPE_COLOR[k]}
        options={[{ key: "all", label: "All" }, { key: "university", label: "Universities" },
                  { key: "uot", label: "UoTs" }, { key: "tvet", label: "TVET" }, { key: "cet", label: "CET" }]} />
      <Chips value={province} onChange={setProvince}
        options={PROVINCES.map((p) => ({ key: p, label: p }))} />
      <p className="text-xs text-slate-600">{results.length} learning providers</p>

      {results.map((p) => (
        <article key={p.id} className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
          style={{ borderLeftColor: TYPE_COLOR[p.type] }}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">{p.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
                <MapPin className="h-3 w-3" />{p.city}, {p.province}
              </p>
            </div>
            <FavouriteButton on={fav.includes(p.id)} onToggle={() => toggleFav(p.id)} label={p.name} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="slate">{PROVIDER_TYPES[p.type]}</Pill>
            {p.nsfas && <Pill tone="green" icon={ShieldCheck}>NSFAS</Pill>}
            {p.residence && <Pill tone="slate">Residence available</Pill>}
            <Pill tone="slate">
              {QUALIFICATIONS.filter((q) => q.providerId === p.id).length} qualifications listed
            </Pill>
          </div>
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
            <a href={`tel:${p.phone.replace(/\s/g, "")}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
              <Phone className="h-3.5 w-3.5" />{p.phone}
            </a>
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
              <Compass className="h-3.5 w-3.5" />{p.site}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
