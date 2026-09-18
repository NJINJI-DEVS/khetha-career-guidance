// R4: careers directory.
//
// Reads from /api/occupations, which is the enriched OFO catalogue, and falls
// back to the bundled twelve when the API cannot be reached. The fallback is
// not defensive padding: this app is used offline and on capped data, and a
// learner who opens Explore with no signal should still see careers rather than
// an error.
//
// Search and field filtering happen server-side because the catalogue is
// hundreds of rows, not twelve — filtering that in the browser would mean
// shipping the whole table to a phone first.

import { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, BriefcaseBusiness, GraduationCap, Search, TrendingUp, Loader2, WifiOff } from 'lucide-react';
import { OCCUPATIONS } from '../../data/occupations';
import { qualById } from '../../data/qualifications';
import { FIELD, FIELDS } from '../../data/fields';
import { listOccupations } from '../../lib/api';
import { SearchBar } from '../ui/SearchBar';
import { Chips } from '../ui/Chips';
import { EmptyState } from '../ui/EmptyState';
import { FavouriteButton } from '../ui/FavouriteButton';
import { Pill } from '../ui/Pill';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

/** Qualification titles, from either the API shape (objects) or the bundled
 *  data's shape (ids into QUALIFICATIONS). */
const qualTitles = (o) =>
  (o.quals || [])
    .map((q) => (typeof q === "string" ? qualById[q]?.title : q?.title))
    .filter(Boolean);

const qualificationType = (title) => {
  if (/^(Bachelor|BSc|BCom|BEd|BEng)\b/i.test(title)) return "Degree";
  if (/diploma/i.test(title)) return "Diploma";
  return "Certificate";
};

export function CareersDirectory({ fav, toggleFav, onOpen, fieldFilter, setFieldFilter }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");  // loading | ready | offline
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q]);

  // A new search or filter always restarts at page 1.
  useEffect(() => { setPage(1); }, [debounced, fieldFilter]);

  useEffect(() => {
    const id = ++reqId.current;
    if (page === 1) setStatus("loading");

    listOccupations({ q: debounced, field: fieldFilter, page, pageSize: PAGE_SIZE })
      .then((d) => {
        if (id !== reqId.current) return;           // a later query already won
        setItems((prev) => (page === 1 ? d.items : [...prev, ...d.items]));
        setTotal(d.total);
        setStatus("ready");
      })
      .catch(() => {
        if (id !== reqId.current) return;
        // Offline or backend down — serve the bundled catalogue instead.
        const s = debounced.toLowerCase();
        const local = OCCUPATIONS
          .filter((o) => (fieldFilter === "all" || !fieldFilter ? true : o.field === fieldFilter))
          .filter((o) => !s || o.title.toLowerCase().includes(s) || o.summary.toLowerCase().includes(s) || o.ofo.includes(s));
        setItems(local);
        setTotal(local.length);
        setStatus("offline");
      });
  }, [debounced, fieldFilter, page]);

  const canLoadMore = status === "ready" && items.length < total;

  return (
    <div className="space-y-3">
      <SearchBar value={q} onChange={setQ} placeholder="Search a career, or an OFO code" />
      <Chips value={fieldFilter} onChange={setFieldFilter}
        colorFor={(k) => FIELD[k]?.color}
        options={[{ key: "all", label: "All fields" }, ...FIELDS.map((f) => ({ key: f.key, label: f.label }))]} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          {status === "loading" ? "Searching…" : `${total} career${total === 1 ? "" : "s"}`}
        </p>
        {status === "offline" && (
          <p className="flex items-center gap-1.5 text-[11px] k-tx-6B5307">
            <WifiOff className="h-3.5 w-3.5" />Showing saved careers
          </p>
        )}
      </div>

      {status === "loading" && items.length === 0 && (
        <p className="flex items-center gap-2 p-4 text-xs text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading careers…
        </p>
      )}

      {items.map((o) => {
        const titles = qualTitles(o);
        const colour = FIELD[o.field]?.color || "#CBD5E1";
        return (
          <article key={o.id} className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
            style={{ borderLeftColor: colour }}>
            <div className="flex items-start gap-3">
              <button onClick={() => onOpen(o.id)} className="flex-1 text-left">
                <h3 className="text-sm font-semibold text-slate-900">{o.title}</h3>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  {FIELD[o.field]?.label || "Career"} · OFO {o.ofo}
                </p>
                {o.summary && <p className="mt-2 text-xs leading-relaxed text-slate-600">{o.summary}</p>}

                <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3">
                  {titles.length > 0 && (
                    <>
                      <div className="flex gap-2.5">
                        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Required qualification</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-800">
                            {[...new Set(titles.map(qualificationType))].join(" or ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2.5">
                        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Courses you can take</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-800">{titles.join(" · ")}</p>
                        </div>
                      </div>
                    </>
                  )}
                  {(o.tasks || []).length > 0 && (
                    <div className="flex gap-2.5">
                      <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">What day-to-day looks like</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-800">{o.tasks.join(" · ")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </button>
              <FavouriteButton on={fav.includes(o.id)} onToggle={() => toggleFav(o.id)} label={o.title} />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {o.demand && <Pill tone={o.demand === "Scarce skill" ? "red" : "slate"} icon={TrendingUp}>{o.demand}</Pill>}
              {o.salary && <Pill tone="slate">{o.salary}</Pill>}
            </div>
          </article>
        );
      })}

      {canLoadMore && (
        <button onClick={() => setPage((p) => p + 1)}
          className="w-full rounded-xl bg-slate-100 py-3 text-xs font-semibold text-slate-900 ring-1 ring-slate-200">
          Show more · {items.length} of {total}
        </button>
      )}

      {status !== "loading" && items.length === 0 && (
        <EmptyState icon={Search} title="No careers match that"
          body="Try a broader word, or clear the field filter to see everything." />
      )}
    </div>
  );
}
