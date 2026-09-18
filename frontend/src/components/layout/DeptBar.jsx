// Extracted from App.jsx's root component (NjinjiCareerGuidance).
// Pure/props-only already in the original — no closures over root state.
import { DhetArms, KhethaWordmark } from '../ui/BrandMarks';

export function DeptBar({ tight }) {
  return (
    <div className={`flex shrink-0 items-center gap-2.5 border-b-2 k-bd-00784A bg-white px-4 ${tight ? "py-2" : "py-2.5"}`}>
      <DhetArms className="h-8" />
      <div className="flex-1 leading-none">
        <p className="text-[11px] font-semibold lowercase tracking-tight text-slate-900">higher education &amp; training</p>
        <p className="mt-0.5 text-[8px] leading-tight text-slate-600">
          Department of Higher Education and Training<br />Republic of South Africa
        </p>
      </div>
      <KhethaWordmark className="h-6" />
    </div>
  );
}
