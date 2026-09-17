// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
export function Panel({ title, hint, children, wide }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
        {hint && <span className="shrink-0 text-[10px] text-slate-600">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
