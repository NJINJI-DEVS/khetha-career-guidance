// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { useEffect } from 'react';
import { X } from 'lucide-react';

export function ModalShell({ title, onClose, children, wide }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4"
      role="dialog" aria-modal="true" aria-label={title}>
      <div className={`max-h-full w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
          <button onClick={onClose} aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
