// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { NSC_BANDS } from '../../data/subjects';
import { toLevel } from '../../engines/levels';
import { Screen } from '../ui/Screen';
import { SectionTitle } from '../ui/SectionTitle';

/* ==================================================================
   APS calculator and what-if simulator
   ================================================================== */

export function ApsCalculator({ onBack, subjects, setSubjects, mathsIsPure, setMathsIsPure, aps, counts, onExplore }) {
  const update = (key, pct) =>
    setSubjects((prev) => prev.map((s) => (s.key === key ? { ...s, pct } : s)));

  return (
    <Screen onBack={onBack} title="APS calculator"
      subtitle="Drag any subject and watch the qualifications open and close in real time.">
      <div className="rounded-2xl bg-slate-900 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300">Admission Point Score</p>
            <p className="text-4xl font-bold tabular-nums k-tx-D4AF37">{aps}</p>
            <p className="mt-1 text-[11px] text-slate-300">Best six subjects, Life Orientation excluded</p>
          </div>
          <div className="space-y-2 text-right">
            <div>
              <p className="text-[11px] text-slate-300">Degrees</p>
              <p className="text-xl font-semibold tabular-nums">{counts.university}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-300">Diplomas</p>
              <p className="text-xl font-semibold tabular-nums">{counts.uot + counts.tvet}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Mathematics stream</p>
        <p className="mt-1 text-xs text-slate-600">
          This choice alone decides whether engineering, actuarial science and computer science stay open.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[{ v: true, label: "Pure Mathematics" }, { v: false, label: "Mathematical Literacy" }].map((o) => (
            <button key={o.label} onClick={() => setMathsIsPure(o.v)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                mathsIsPure === o.v ? "k-bd-005A36 k-bg-005A36 text-white" : "border-slate-200 bg-white text-slate-700"
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <SectionTitle hint="Drag to simulate">What-if simulator</SectionTitle>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        {subjects.map((s) => (
          <div key={s.key}>
            <div className="flex items-center justify-between">
              <label htmlFor={`aps-${s.key}`} className="text-xs font-medium text-slate-700">
                {s.key === "maths" && !mathsIsPure ? "Mathematical Literacy" : s.label}
                {s.excluded && <span className="ml-1 text-[10px] text-slate-500">(not counted)</span>}
              </label>
              <span className="flex items-center gap-2">
                <span className="text-xs font-semibold tabular-nums text-slate-900">{s.pct}%</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  s.excluded ? "bg-slate-100 text-slate-500" : "k-bg-F4E8C9 k-tx-6B5307"
                }`}>L{toLevel(s.pct)}</span>
              </span>
            </div>
            <input id={`aps-${s.key}`} type="range" min={0} max={100} value={s.pct}
              onChange={(e) => update(s.key, Number(e.target.value))}
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 k-ac-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">NSC level scale</p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {NSC_BANDS.filter((b) => b.level >= 2).map((b) => (
            <div key={b.level} className="flex items-center gap-2">
              <span className="w-6 rounded bg-slate-900 py-0.5 text-center text-[10px] font-bold text-white">L{b.level}</span>
              <span className="text-[11px] text-slate-600">{b.min}–{b.level === 7 ? 100 : b.min + 9}%</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onExplore}
        className="mt-4 w-full rounded-xl k-bg-005A36 px-4 py-3 text-sm font-semibold text-white">
        See the {counts.university + counts.uot + counts.tvet} qualifications you meet
      </button>
    </Screen>
  );
}
