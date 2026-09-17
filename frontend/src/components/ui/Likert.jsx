// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { AGREE_SCALE } from '../../data/assessments';

export function Likert({ value, onChange, name }) {
  return (
    <div className="mt-3 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={name}>
      {AGREE_SCALE.map((s) => (
        <button
          key={s.v}
          role="radio"
          aria-checked={value === s.v}
          onClick={() => onChange(s.v)}
          className={`rounded-lg px-1 py-2 text-[10px] font-medium leading-tight transition-colors ${
            value === s.v
              ? "k-bg-005A36 text-white"
              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
