// The preference fields a learner declares about themselves.
//
// One component, used in two places: the onboarding step that captures these
// the first time, and the account settings page that edits them afterwards.
// Shared rather than written twice, because two copies drift — and a settings
// page missing a field that onboarding asked about is how people end up being
// asked the same question again.

import {
  Compass, GraduationCap, MapPin, Clock, Route,
} from 'lucide-react';
import { FIELDS } from '../../data/fields';
import { PROVINCES } from '../../data/provinces';

const EDUCATION_LEVELS = [
  { key: "grade9", label: "Grade 9" },
  { key: "grade10", label: "Grade 10" },
  { key: "grade11", label: "Grade 11" },
  { key: "matric", label: "Grade 12 / Matric" },
  { key: "tvet", label: "At a TVET college" },
  { key: "university", label: "At university" },
  { key: "working", label: "Out of school" },
];

const STUDY_MODES = [
  { key: "any", label: "Any" },
  { key: "fulltime", label: "Full time" },
  { key: "parttime", label: "Part time" },
  { key: "distance", label: "Distance" },
];

const TRAVEL = [
  { v: 25, label: "Under 25 km" },
  { v: 100, label: "Within my area" },
  { v: 500, label: "Same province" },
  { v: null, label: "Anywhere" },
];

function Group({ icon: Icon, label, hint, children }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-semibold text-slate-900">
        <Icon className="h-4 w-4 shrink-0" />{label}
      </p>
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function PreferencesForm({ value, onChange }) {
  const v = value || {};
  const set = (patch) => onChange({ ...v, ...patch });

  const toggleField = (key) => {
    const cur = v.fieldsOfInterest || [];
    set({
      fieldsOfInterest: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
    });
  };

  return (
    <div className="space-y-4">
      <Group icon={Compass} label="What are you interested in?"
        hint="Pick as many as you like. This orders what you see first — it never hides anything.">
        <div className="grid grid-cols-2 gap-2">
          {FIELDS.map((f) => {
            const Icon = f.icon;
            const on = (v.fieldsOfInterest || []).includes(f.key);
            return (
              <button key={f.key} type="button" onClick={() => toggleField(f.key)}
                aria-pressed={on}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-[11px] font-medium transition-colors ${
                  on ? "text-white" : "bg-slate-100 text-slate-700"
                }`}
                style={on ? { backgroundColor: f.color } : undefined}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="leading-tight">{f.label}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group icon={GraduationCap} label="Where are you right now?">
        <div className="flex flex-wrap gap-2">
          {EDUCATION_LEVELS.map((l) => (
            <button key={l.key} type="button" onClick={() => set({ educationLevel: l.key })}
              aria-pressed={v.educationLevel === l.key}
              className={`rounded-lg px-3 py-2 text-[11px] font-medium transition-colors ${
                v.educationLevel === l.key ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700"
              }`}>{l.label}</button>
          ))}
        </div>
      </Group>

      <Group icon={MapPin} label="Where would you like to study?"
        hint="This can be different from where you live.">
        <select value={v.preferredProvince || ""}
          onChange={(e) => set({ preferredProvince: e.target.value || null })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37">
          <option value="">No preference</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Group>

      <Group icon={Route} label="How far can you travel?"
        hint="For many learners this matters more than marks do, so it filters the providers you are shown.">
        <div className="grid grid-cols-4 gap-2">
          {TRAVEL.map((o) => (
            <button key={o.label} type="button" onClick={() => set({ maxTravelKm: o.v })}
              aria-pressed={v.maxTravelKm === o.v}
              className={`rounded-lg px-1.5 py-2 text-[10px] font-medium leading-tight transition-colors ${
                v.maxTravelKm === o.v ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700"
              }`}>{o.label}</button>
          ))}
        </div>
      </Group>

      <Group icon={Clock} label="How do you want to study?">
        <div className="grid grid-cols-4 gap-2">
          {STUDY_MODES.map((m) => (
            <button key={m.key} type="button" onClick={() => set({ studyMode: m.key })}
              aria-pressed={v.studyMode === m.key}
              className={`rounded-lg px-1.5 py-2 text-[10px] font-medium transition-colors ${
                (v.studyMode || "any") === m.key ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700"
              }`}>{m.label}</button>
          ))}
        </div>
      </Group>
    </div>
  );
}

export { EDUCATION_LEVELS, STUDY_MODES };
