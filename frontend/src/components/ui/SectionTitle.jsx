// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
export function SectionTitle({ children, hint }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight text-slate-900">{children}</h2>
      {hint ? <span className="text-xs text-slate-600">{hint}</span> : null}
    </div>
  );
}
