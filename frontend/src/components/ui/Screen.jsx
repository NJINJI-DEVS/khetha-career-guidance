// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { ArrowLeft } from 'lucide-react';

export function Screen({ title, subtitle, onBack, children, action }) {
  return (
    <div className="p-4 pb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}
      {title && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
