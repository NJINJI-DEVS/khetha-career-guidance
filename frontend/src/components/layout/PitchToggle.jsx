// Extracted from App.jsx's root component (NjinjiCareerGuidance).
// Originally an inline closure over `pitchMode`/`setPitchMode`/`setTab`/`setRoute`;
// converted to explicit props (`pitchMode`, `onToggle`) so it can live in its own
// file — the root now does `onToggle={() => { setPitchMode(v => !v); setTab("dashboard"); setRoute(null); }}`.
export function PitchToggle({ compact, pitchMode, onToggle }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2 ${compact ? "" : "w-full"}`}>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-900">Pitch Mode</p>
        <p className="truncate text-[10px] text-slate-600">
          {pitchMode ? "Thandi · Grade 12, post-subject choice" : "Sipho · Grade 9, pre-subject choice"}
        </p>
      </div>
      <button role="switch" aria-checked={pitchMode} aria-label="Switch demo learner"
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${pitchMode ? "k-bg-D4AF37" : "bg-slate-400"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${pitchMode ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
