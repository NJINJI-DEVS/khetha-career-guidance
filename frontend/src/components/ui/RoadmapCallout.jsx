// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { Info } from 'lucide-react';

export function RoadmapCallout() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border k-bd-D4AF37 k-bg-FBF5E7 p-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 k-tx-6B5307" />
      <p className="text-[11px] leading-relaxed k-tx-6B5307">
        <span className="font-semibold">How verification works today.</span> Every mentor in this MVP is vouched for
        by a partner NGO or a student society, because those organisations already run their own vetting. The roadmap
        adds SACE registration numbers for teachers, academic transcript checks with institutions, and corporate email
        domain verification for industry professionals.
      </p>
    </div>
  );
}
