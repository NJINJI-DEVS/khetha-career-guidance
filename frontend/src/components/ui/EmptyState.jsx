// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
export function EmptyState({ icon: Icon, title, body, cta, onCta }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      {Icon && <Icon className="mx-auto h-8 w-8 text-slate-400" />}
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{body}</p>
      {cta && (
        <button
          onClick={onCta}
          className="mt-4 rounded-lg k-bg-005A36 px-4 py-2 text-xs font-semibold text-white"
        >
          {cta}
        </button>
      )}
    </div>
  );
}
