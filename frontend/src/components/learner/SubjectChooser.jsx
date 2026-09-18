// GET phase (General Education and Training) — Subject Chooser.
//
// Restructured from three thin steps into a guided decision. What changed and
// why: the old version asked for six marks, ranked six packages by a single
// readiness number, and listed subject names. It never said why a subject was
// in a package, what a package gave up, or that the Maths/Maths Literacy fork
// is the decision everything else hangs off. Those are the things a Grade 9
// learner and their parent actually need.

import { useState, useMemo } from 'react';
import {
  Camera, CheckCircle2, AlertTriangle, Award, ChevronRight, ArrowRight,
  Info, Sparkles, XCircle,
} from 'lucide-react';
import { GET_SUBJECTS, GET_TO_FET, SUBJECT_LABELS } from '../../data/subjects';
import { PACKAGE_LIST, MATHS_REQUIREMENT } from '../../data/packages';
import { chooseSubjects, pathwayWarnings } from '../../engines/subjects';
import { PHASES } from '../../data/subjectRoles';
import { Screen } from '../ui/Screen';
import { Pill } from '../ui/Pill';
import { Progress } from '../ui/Progress';
import { SectionTitle } from '../ui/SectionTitle';
import { OcrScanModal } from './OcrScanModal';
import { PackageDetail } from './PackageDetail';

const DEFAULT_MARKS = {
  english: 58, fal: 62, maths: 48, lifesci: 52,
  social: 60, tech: 55, ems: 61, creative: 57, lo: 70,
};

// What the simulated scan reads off a Grade 9 report card.
const MOCK_GET_SCAN = GET_SUBJECTS.map((s) => ({ label: s.label, pct: DEFAULT_MARKS[s.key] }));

export function SubjectChooser({ onBack, onSave, saved, go }) {
  const [step, setStep] = useState(saved ? 3 : 0);
  const [interests, setInterests] = useState(saved?.interests || []);
  const [marks, setMarks] = useState({ ...DEFAULT_MARKS, ...(saved?.marks || {}) });
  const [scanOpen, setScanOpen] = useState(false);
  const [openPackage, setOpenPackage] = useState(null);

  const results = useMemo(() => chooseSubjects(marks, interests), [marks, interests]);
  const warnings = useMemo(() => pathwayWarnings(marks), [marks]);

  const toggle = (k) =>
    setInterests((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  const detail = openPackage ? results.find((r) => r.key === openPackage) : null;
  if (detail) {
    return <PackageDetail pkg={detail} go={go} onBack={() => setOpenPackage(null)} />;
  }

  /* ---------- Step 0: what this phase decides ---------- */
  if (step === 0) {
    return (
      <Screen onBack={onBack} title="Subject Chooser"
        subtitle={`${PHASES.get.name} — ${PHASES.get.grades}`}>
        <div className="rounded-2xl k-grad-green p-4 text-white">
          <p className="text-xs k-tx-BFE5D4">{PHASES.get.code} phase</p>
          <p className="mt-0.5 text-base font-semibold">{PHASES.get.decision}</p>
          <p className="mt-2 text-[11px] leading-relaxed k-tx-BFE5D4">{PHASES.get.blurb}</p>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Why this is the decision that matters</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Your Grade 10 package decides which qualifications you may apply for three years later. Changing it after
            Grade 10 is difficult and after Grade 11 is usually impossible. Engineering, medicine and chartered
            accountancy close permanently without Pure Mathematics and Physical Sciences — not because your marks were
            low, but because you were never enrolled in the subject.
          </p>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
            This tool reads your Grade 9 marks, ranks the {PACKAGE_LIST.length} packages against them, and tells you
            what each one opens and what it gives up.
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { n: "1", l: "What interests you" },
            { n: "2", l: "Your Grade 9 marks" },
            { n: "3", l: "Packages ranked" },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
              <p className="text-sm font-bold k-tx-005A36">{s.n}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{s.l}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setStep(1)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Start <ArrowRight className="h-4 w-4" />
        </button>
      </Screen>
    );
  }

  /* ---------- Step 1: interests ---------- */
  if (step === 1) {
    return (
      <Screen onBack={() => setStep(0)} title="Step 1 of 3: what interests you?"
        subtitle={`Pick as many as you like. Leave it blank and we compare all ${PACKAGE_LIST.length}.`}>
        <div className="space-y-2.5">
          {PACKAGE_LIST.map((p) => {
            const on = interests.includes(p.key);
            const maths = MATHS_REQUIREMENT[p.mathsRequirement];
            return (
              <button key={p.key} onClick={() => toggle(p.key)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                  on ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
                }`}>
                <span className="mt-0.5 h-10 w-1.5 shrink-0 rounded-full"
                  style={{ background: on ? p.color : "#E2E8F0" }} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{p.title}</span>
                    {on && <CheckCircle2 className="h-4 w-4 k-tx-005A36" />}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">{p.short}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <Pill tone={maths.tone}>{maths.key === "pure" ? "Pure Maths" : maths.key === "preferred" ? "Maths preferred" : "Either Maths"}</Pill>
                    {p.careers.slice(0, 2).map((c) => <Pill key={c}>{c}</Pill>)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setStep(2)}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          {interests.length ? `Next — compare ${interests.length} package${interests.length === 1 ? "" : "s"}` : "Next — compare all"}
        </button>
      </Screen>
    );
  }

  /* ---------- Step 2: marks ---------- */
  if (step === 2) {
    return (
      <Screen onBack={() => setStep(1)} title="Step 2 of 3: your Grade 9 marks"
        subtitle="Enter your latest report marks, or scan the report card. Each subject shows what it becomes in Grade 10.">
        <button onClick={() => setScanOpen(true)}
          className="mb-4 flex w-full items-center gap-3 rounded-xl border border-dashed k-bd-00784A k-bg-E7F4EE p-3 text-left">
          <Camera className="h-5 w-5 k-tx-005A36" />
          <span className="flex-1">
            <span className="block text-sm font-semibold k-tx-005A36">Scan report card</span>
            <span className="block text-[11px] text-slate-600">Faster than nine sliders</span>
          </span>
          <Sparkles className="h-4 w-4 k-tx-D4AF37" />
        </button>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          {GET_SUBJECTS.map((s) => {
            const becomes = (GET_TO_FET[s.key] || []).slice(0, 3).map((k) => SUBJECT_LABELS[k]).filter(Boolean);
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`m-${s.key}`} className="text-xs font-medium text-slate-700">{s.label}</label>
                  <span className="text-xs font-semibold tabular-nums text-slate-900">{marks[s.key]}%</span>
                </div>
                <input id={`m-${s.key}`} type="range" min={0} max={100} value={marks[s.key]}
                  onChange={(e) => setMarks((m) => ({ ...m, [s.key]: Number(e.target.value) }))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 k-ac-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
                {becomes.length > 0 && (
                  <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
                    Becomes: {becomes.join(", ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setStep(3);
            onSave({ interests, marks, results: chooseSubjects(marks, interests), warnings: pathwayWarnings(marks) });
          }}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          See my packages
        </button>

        {scanOpen && (
          <OcrScanModal
            detected={MOCK_GET_SCAN}
            applyLabel="Use these marks"
            onClose={() => setScanOpen(false)}
            onApply={(rows) => {
              const next = { ...marks };
              rows.forEach((r) => {
                const match = GET_SUBJECTS.find((s) => s.label === r.label);
                if (match) next[match.key] = r.pct;
              });
              setMarks(next);
              setScanOpen(false);
            }}
          />
        )}
      </Screen>
    );
  }

  /* ---------- Step 3: results ---------- */
  return (
    <Screen onBack={onBack} title="Your Grade 10 packages"
      subtitle="Ranked by how ready your current marks are. Tap any package for the full picture."
      action={
        <button onClick={() => setStep(1)}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200">
          Redo
        </button>
      }>

      {/* Pathway-blocking warnings first — these matter more than the ranking */}
      {warnings.length > 0 && (
        <div className="mb-4 space-y-2.5">
          {warnings.map((w) => (
            <div key={w.title} className={`rounded-2xl border p-3.5 ${
              w.level === "high" ? "k-bd-E5A79F k-bg-FBEAE8" : "k-bd-E4CE8A k-bg-FBF5E7"
            }`}>
              <p className={`flex items-center gap-2 text-sm font-semibold ${
                w.level === "high" ? "k-tx-9B1C14" : "k-tx-6B5307"
              }`}>
                <AlertTriangle className="h-4 w-4 shrink-0" />{w.title}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">{w.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {results.map((p, i) => (
          <button key={p.key} onClick={() => setOpenPackage(p.key)}
            className="w-full rounded-2xl border border-l-4 border-slate-200 bg-white p-4 text-left"
            style={{ borderLeftColor: p.color }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{p.short}</p>
              </div>
              {i === 0
                ? <Pill tone="gold" icon={Award}>Best fit</Pill>
                : <Pill tone={p.verdict.tone}>{p.verdict.label}</Pill>}
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1"><Progress value={p.readiness} max={100} color={p.color} /></div>
              <span className="text-[11px] font-semibold tabular-nums text-slate-700">{p.readiness}%</span>
            </div>

            {/* Strengths and gaps, in words rather than a bare number */}
            <div className="mt-3 space-y-1.5">
              {p.strengths.slice(0, 2).map((s) => (
                <p key={s} className="flex items-start gap-1.5 text-[11px] leading-relaxed k-tx-005A36">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{s}
                </p>
              ))}
              {p.gaps.slice(0, 2).map((g) => (
                <p key={g} className="flex items-start gap-1.5 text-[11px] leading-relaxed k-tx-6B5307">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{g}
                </p>
              ))}
            </div>

            {p.mathsRisk && (
              <p className="mt-2 rounded-lg k-bg-FBEAE8 p-2.5 text-[11px] font-medium leading-relaxed k-tx-9B1C14">
                {p.mathsRisk}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
              {p.subjects.filter((s) => s.role === "core").map((s) => (
                <Pill key={s.key} tone="green">{SUBJECT_LABELS[s.key] || s.key}</Pill>
              ))}
              {p.subjects.filter((s) => s.role !== "core").slice(0, 2).map((s) => (
                <Pill key={s.key}>{SUBJECT_LABELS[s.key] || s.key}</Pill>
              ))}
            </div>

            <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600">
              <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
              <span><span className="font-semibold">Gives up: </span>{p.closes}</span>
            </p>

            <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold k-tx-005A36">
              Full breakdown <ChevronRight className="h-3.5 w-3.5" />
            </p>
          </button>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-100 p-3 text-[11px] leading-relaxed text-slate-600">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Readiness compares your Grade 9 marks against what each package expects. It is a guide for the conversation
        with your Life Orientation teacher, not a decision — and a package you want is worth working toward.
      </p>
    </Screen>
  );
}
