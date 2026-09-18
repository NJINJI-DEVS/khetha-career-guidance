// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useMemo } from 'react';
import { Camera, Loader2, Sparkles, CheckCircle2, AlertTriangle, Award } from 'lucide-react';
import { SUBJECT_LABELS } from '../../data/subjects';
import { PACKAGES } from '../../data/packages';
import { chooseSubjects } from '../../engines/subjects';
import { Screen } from '../ui/Screen';
import { Pill } from '../ui/Pill';
import { Progress } from '../ui/Progress';

/* ==================================================================
   R2: Subject Chooser
   ================================================================== */

const GR9_SUBJECTS = [
  { key: "maths", label: "Mathematics" },
  { key: "lifesci", label: "Natural Sciences" },
  { key: "english", label: "English" },
  { key: "ems", label: "Economic & Management Sciences" },
  { key: "tech", label: "Technology" },
  { key: "social", label: "Social Sciences" },
];

export function SubjectChooser({ onBack, onSave, saved }) {
  const [step, setStep] = useState(saved ? 3 : 0);
  const [interests, setInterests] = useState(saved?.interests || []);
  const [marks, setMarks] = useState(
    saved?.marks || { maths: 48, lifesci: 52, english: 58, ems: 61, tech: 55, social: 60 }
  );
  const [scanning, setScanning] = useState(false);

  const results = useMemo(() => chooseSubjects(marks, interests), [marks, interests]);

  const toggle = (k) =>
    setInterests((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  if (step === 0) {
    return (
      <Screen onBack={onBack} title="Subject Chooser"
        subtitle="Three short steps. We match your Grade 9 marks to the Grade 10 package that opens the careers you actually want.">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Why this matters</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Your Grade 10 subject package decides which qualifications you can apply for three years later. Changing it
            after Grade 10 is difficult, and some doors — engineering, medicine, chartered accountancy — close
            permanently without Pure Mathematics and Physical Sciences.
          </p>
        </div>
        <button onClick={() => setStep(1)}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Start
        </button>
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen onBack={() => setStep(0)} title="Step 1 of 3: what interests you?"
        subtitle="Pick as many as you like. Leave it blank and we will compare all six packages.">
        <div className="space-y-2.5">
          {Object.values(PACKAGES).map((p) => {
            const on = interests.includes(p.key);
            return (
              <button key={p.key} onClick={() => toggle(p.key)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  on ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
                }`}>
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded"
                  style={{ background: on ? p.color : "#E2E8F0" }} />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{p.title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-600">{p.opens}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setStep(2)}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Next
        </button>
      </Screen>
    );
  }

  if (step === 2) {
    return (
      <Screen onBack={() => setStep(1)} title="Step 2 of 3: your Grade 9 marks"
        subtitle="Enter your latest report marks, or scan the report card and we will read them for you.">
        <button onClick={() => { setScanning(true); setTimeout(() => setScanning(false), 1800); }}
          className="mb-4 flex w-full items-center gap-3 rounded-xl border border-dashed k-bd-00784A k-bg-E7F4EE p-3 text-left">
          <Camera className="h-5 w-5 k-tx-005A36" />
          <span className="flex-1 text-sm font-semibold k-tx-005A36">
            {scanning ? "Reading your report card…" : "Scan report card"}
          </span>
          {scanning ? <Loader2 className="h-4 w-4 animate-spin k-tx-005A36" /> : <Sparkles className="h-4 w-4 k-tx-D4AF37" />}
        </button>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          {GR9_SUBJECTS.map((s) => (
            <div key={s.key}>
              <div className="flex items-center justify-between">
                <label htmlFor={`m-${s.key}`} className="text-xs font-medium text-slate-700">{s.label}</label>
                <span className="text-xs font-semibold tabular-nums text-slate-900">{marks[s.key]}%</span>
              </div>
              <input id={`m-${s.key}`} type="range" min={0} max={100} value={marks[s.key]}
                onChange={(e) => setMarks((m) => ({ ...m, [s.key]: Number(e.target.value) }))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 k-ac-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
            </div>
          ))}
        </div>
        <button onClick={() => { setStep(3); onSave({ interests, marks, results: chooseSubjects(marks, interests) }); }}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          See my packages
        </button>
      </Screen>
    );
  }

  return (
    <Screen onBack={onBack} title="Your Grade 10 packages"
      subtitle="Ranked by how ready your current marks are for each pathway."
      action={
        <button onClick={() => setStep(1)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200">
          Redo
        </button>
      }>
      <div className="space-y-3">
        {results.map((p, i) => (
          <div key={p.key} className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4"
            style={{ borderLeftColor: p.color }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{p.title}</p>
              {i === 0 ? <Pill tone="gold" icon={Award}>Best fit</Pill> : <span className="text-xs text-slate-600">{p.readiness}% ready</span>}
            </div>
            <div className="mt-2"><Progress value={p.readiness} max={100} color={p.color} /></div>

            <div className="mt-3 space-y-1.5">
              {p.gates.map((g) => (
                <p key={g.subject} className={`flex items-center gap-1.5 text-[11px] ${g.met ? "k-tx-005A36" : "k-tx-6B5307"}`}>
                  {g.met ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                  {SUBJECT_LABELS[g.subject] || g.subject}: you have {g.got ?? "—"}%, this package wants {g.min}%
                </p>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.subjects.map((s) => <Pill key={s}>{SUBJECT_LABELS[s]}</Pill>)}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{p.note}</p>
            <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-600">Opens: {p.opens}</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}
