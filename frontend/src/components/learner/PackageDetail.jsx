// GET phase: the full case for one Grade 10 subject package.
//
// The version this replaces showed a title, a readiness bar and a list of
// subject names. A learner could not tell from it why a subject was on the
// list, what it would be used for, or what choosing this package gave up —
// which is most of what the decision actually turns on.

import { CheckCircle2, AlertTriangle, XCircle, Briefcase, GraduationCap, ChevronRight, Info } from 'lucide-react';
import { SUBJECT_LABELS } from '../../data/subjects';
import { SUBJECT_PURPOSE } from '../../data/subjectRoles';
import { MATHS_REQUIREMENT, SUBJECT_ROLE_STYLE } from '../../data/packages';
import { qualById } from '../../data/qualifications';
import { Screen } from '../ui/Screen';
import { Pill } from '../ui/Pill';
import { Progress } from '../ui/Progress';
import { SectionTitle } from '../ui/SectionTitle';

export function PackageDetail({ pkg, onBack, go }) {
  const maths = MATHS_REQUIREMENT[pkg.mathsRequirement];

  return (
    <Screen onBack={onBack} title={pkg.title} subtitle={pkg.short}>
      {/* Readiness */}
      <div className="rounded-2xl p-4 text-white" style={{ background: pkg.color }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs opacity-80">How ready your marks are</p>
            <p className="mt-0.5 text-3xl font-bold tabular-nums">{pkg.readiness}%</p>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{pkg.verdict.label}</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed opacity-90">{pkg.verdict.blurb}</p>
      </div>

      {/* The Maths decision, called out on its own */}
      <div className={`mt-3 rounded-2xl border p-4 ${
        maths.key === "pure" ? "k-bd-E5A79F k-bg-FBEAE8"
          : maths.key === "preferred" ? "k-bd-E4CE8A k-bg-FBF5E7"
          : "border-slate-200 bg-white"
      }`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {maths.key === "either" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {maths.label}
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">{maths.detail}</p>
        {pkg.mathsRisk && (
          <p className="mt-2 rounded-lg bg-white/70 p-2.5 text-[11px] font-medium leading-relaxed k-tx-9B1C14">
            {pkg.mathsRisk}
          </p>
        )}
      </div>

      {/* Subjects, each with a reason */}
      <SectionTitle hint={`${pkg.subjects.length} subjects`}>Subjects you would take</SectionTitle>
      <div className="space-y-2.5">
        {pkg.subjects.map((s) => {
          const purpose = SUBJECT_PURPOSE[s.key];
          const style = SUBJECT_ROLE_STYLE[s.role];
          return (
            <div key={s.key} className="rounded-2xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {purpose?.label || SUBJECT_LABELS[s.key] || s.key}
                </p>
                <Pill tone={style.tone}>{style.label}</Pill>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">{s.why}</p>
              {purpose && (
                <div className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2.5">
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    <span className="font-semibold text-slate-800">What it builds: </span>{purpose.builds}
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    <span className="font-semibold text-slate-800">Where it leads: </span>{purpose.opens}
                  </p>
                  {purpose.closes && (
                    <p className="text-[11px] leading-relaxed k-tx-9B1C14">
                      <span className="font-semibold">Without it: </span>{purpose.closes}
                    </p>
                  )}
                  {purpose.getSignal && (
                    <p className="flex items-start gap-1.5 rounded-lg bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-600">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" />{purpose.getSignal}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Where the learner stands against the gates */}
      <SectionTitle hint={pkg.idealMarks}>Your marks against this package</SectionTitle>
      <div className="space-y-2">
        {pkg.gates.map((g) => (
          <div key={g.subject} className={`flex items-start gap-2.5 rounded-xl border p-3 ${
            g.met ? "k-bd-00784A k-bg-E7F4EE" : "k-bd-E4CE8A k-bg-FBF5E7"
          }`}>
            {g.met
              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
              : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 k-tx-6B5307" />}
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-900">{g.label}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700">
                {g.got === null
                  ? `No mark entered. This package wants ${g.min}%.`
                  : g.met
                    ? `You have ${g.got}%, which clears the ${g.min}% wanted.`
                    : `You have ${g.got}%, and this package wants ${g.min}% — ${g.gap} point${g.gap === 1 ? "" : "s"} to find.`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Outcomes */}
      <SectionTitle>What this opens</SectionTitle>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] leading-relaxed text-slate-700">{pkg.opens}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pkg.careers.map((c) => <Pill key={c} tone="blue" icon={Briefcase}>{c}</Pill>)}
        </div>
      </div>

      {pkg.quals?.length > 0 && (
        <>
          <SectionTitle hint="Tap to open">Qualifications this leads to</SectionTitle>
          <div className="space-y-2">
            {pkg.quals.filter((id) => qualById[id]).map((id) => {
              const q = qualById[id];
              return (
                <button key={id} onClick={() => go?.(`qual:${id}`)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left">
                  <GraduationCap className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-900">{q.title}</span>
                    <span className="block text-[11px] text-slate-600">NQF {q.nqf} · {q.duration} · APS {q.minAPS}+</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-4 rounded-2xl k-bd-E4CE8A k-bg-FBF5E7 border p-4">
        <p className="flex items-center gap-2 text-sm font-semibold k-tx-6B5307">
          <XCircle className="h-4 w-4" />What this closes
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed k-tx-6B5307">{pkg.closes}</p>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Worth knowing</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">{pkg.note}</p>
      </div>
    </Screen>
  );
}
