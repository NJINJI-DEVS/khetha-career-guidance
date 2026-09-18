// FET phase (Further Education and Training) — Subject Evaluation.
//
// The Grade 10–12 counterpart to the GET Subject Chooser. Once the package is
// fixed, "which subjects should I take?" stops being the question and three
// others replace it: what is each subject doing for me, which one is holding me
// back, and where would extra effort actually pay off.

import { useMemo } from 'react';
import {
  TrendingUp, CheckCircle2, AlertTriangle, Lock, Unlock, Target,
  GraduationCap, ChevronRight, Info, Sparkles, BookOpen,
} from 'lucide-react';
import { evaluateSubjects, improvementLevers, evaluationSummary, nearMisses } from '../../engines/subjectEvaluation';
import { Screen } from '../ui/Screen';
import { Pill } from '../ui/Pill';
import { Progress } from '../ui/Progress';
import { SectionTitle } from '../ui/SectionTitle';
import { EmptyState } from '../ui/EmptyState';

export function SubjectEvaluation({ subjects, mathsIsPure, onBack, go }) {
  const evaluated = useMemo(
    () => evaluateSubjects({ subjects, mathsIsPure }),
    [subjects, mathsIsPure]
  );
  const levers = useMemo(
    () => improvementLevers({ subjects, mathsIsPure }),
    [subjects, mathsIsPure]
  );
  const summary = useMemo(
    () => evaluationSummary({ subjects, mathsIsPure }),
    [subjects, mathsIsPure]
  );
  const near = useMemo(
    () => nearMisses({ subjects, mathsIsPure }),
    [subjects, mathsIsPure]
  );

  if (!subjects?.length) {
    return (
      <Screen onBack={onBack} title="Subject evaluation">
        <EmptyState icon={BookOpen} title="No subjects on file"
          body="Add your NSC subjects and marks first — the evaluation reads them to work out what each one is opening and blocking."
          cta="Open the APS calculator" onCta={() => go?.("tab:aps")} />
      </Screen>
    );
  }

  return (
    <Screen onBack={onBack} title="Subject evaluation"
      subtitle="Further Education and Training — what each of your subjects is doing for you.">

      {/* Headline */}
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">FET phase · Grades 10–12</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/15 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Your APS</p>
            <p className="text-lg font-bold tabular-nums">{summary.aps}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Courses open</p>
            <p className="text-lg font-bold tabular-nums">{summary.eligibleCount}/{summary.totalQuals}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Subjects</p>
            <p className="text-lg font-bold tabular-nums">{summary.subjectCount}</p>
          </div>
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed k-tx-BFE5D4">
          {mathsIsPure
            ? "You are taking Pure Mathematics, which keeps the engineering, science and chartered accountancy routes open."
            : "You are taking Mathematical Literacy. Diplomas, N-courses and many degrees remain open; engineering, BSc and the CA route do not."}
        </p>
      </div>

      {/* When no single subject unlocks anything, say so and show what is
          actually closest — an empty panel would read as a broken feature. */}
      {levers.length === 0 && near.length > 0 && (
        <>
          <SectionTitle hint="Closest first">What you are nearest to</SectionTitle>
          <div className="rounded-2xl k-bd-E4CE8A k-bg-FBF5E7 border p-3.5">
            <p className="flex items-center gap-2 text-sm font-semibold k-tx-6B5307">
              <Info className="h-4 w-4" />No single subject changes the outcome
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">
              Lifting any one mark by up to 15 points does not open a new qualification from here, which usually means
              your APS is the binding constraint rather than one subject. Broad improvement across your best six moves
              you further than concentrating on one.
            </p>
          </div>
          <div className="mt-2.5 space-y-2">
            {near.map((n) => (
              <button key={n.qual.id} onClick={() => go?.(`qual:${n.qual.id}`)}
                className="flex w-full items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-900">{n.qual.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">
                    Still needed: {n.unmet.join(" · ")}
                  </span>
                </span>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* The question learners actually ask */}
      {levers.length > 0 && (
        <>
          <SectionTitle hint="Ranked by what it opens">If you could lift one mark</SectionTitle>
          <div className="space-y-2.5">
            {levers.slice(0, 3).map((l, i) => (
              <div key={l.key} className={`rounded-2xl border p-3.5 ${
                i === 0 ? "k-bd-D4AF37 k-bg-FBF5E7" : "border-slate-200 bg-white"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {i === 0 ? <Target className="h-4 w-4 k-tx-6B5307" /> : <TrendingUp className="h-4 w-4 text-slate-500" />}
                    {l.label}
                  </p>
                  {i === 0 && <Pill tone="gold">Biggest effect</Pill>}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">
                  From <span className="font-semibold tabular-nums">{l.from}%</span> to{" "}
                  <span className="font-semibold tabular-nums">{l.to}%</span> — {l.step} points — opens{" "}
                  <span className="font-semibold">{l.unlocks.length} more qualification{l.unlocks.length === 1 ? "" : "s"}</span>
                  {l.apsGain > 0 && ` and lifts your APS by ${l.apsGain}`}.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {l.unlocks.slice(0, 3).map((q) => (
                    <button key={q.id} onClick={() => go?.(`qual:${q.id}`)}>
                      <Pill tone="green" icon={Unlock}>{q.title}</Pill>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Subject by subject */}
      <SectionTitle hint={`Best ${summary.countedCount} count toward your APS`}>Your subjects</SectionTitle>
      <div className="space-y-2.5">
        {evaluated.map((s) => (
          <div key={s.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-start gap-3 p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100">
                <span className="text-sm font-bold tabular-nums text-slate-900">{s.level}</span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                  <Pill tone={s.band.tone}>{s.band.label}</Pill>
                  {s.countsToAps
                    ? <Pill tone="slate">Counts to APS</Pill>
                    : <Pill tone="slate">Not counted</Pill>}
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  {s.pct}% · NSC level {s.level} · {s.bandLabel}
                </p>
                <div className="mt-2"><Progress value={s.pct} max={100} color={s.pct >= 55 ? "#00784A" : "#D4AF37"} /></div>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-slate-100 p-3.5">
              {s.excludedReason && (
                <p className="flex items-start gap-1.5 rounded-lg bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-600">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />{s.excludedReason}
                </p>
              )}

              {s.purpose && (
                <>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    <span className="font-semibold text-slate-800">What it opens: </span>{s.purpose.opens}
                  </p>
                  {s.purpose.note && (
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      <span className="font-semibold text-slate-800">Worth knowing: </span>{s.purpose.note}
                    </p>
                  )}
                </>
              )}

              {s.unlocks.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold k-tx-005A36">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Currently clearing this subject's bar for {s.unlocks.length} qualification{s.unlocks.length === 1 ? "" : "s"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {s.unlocks.slice(0, 4).map((q) => (
                      <button key={q.id} onClick={() => go?.(`qual:${q.id}`)}>
                        <Pill tone="green">{q.title}</Pill>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {s.blocks.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold k-tx-9B1C14">
                    <Lock className="h-3.5 w-3.5" />
                    Standing between you and {s.blocks.length} qualification{s.blocks.length === 1 ? "" : "s"}
                  </p>
                  <div className="mt-1.5 space-y-1.5">
                    {s.blocks.slice(0, 3).map((b) => (
                      <button key={b.qual.id} onClick={() => go?.(`qual:${b.qual.id}`)}
                        className="flex w-full items-center gap-2 rounded-lg bg-slate-50 p-2 text-left">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] font-medium text-slate-900">{b.qual.title}</span>
                          <span className="block text-[10px] text-slate-600">
                            wants {b.needed}% — you are {b.gap} point{b.gap === 1 ? "" : "s"} short
                          </span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {s.purpose?.closes && (
                <p className="border-t border-slate-100 pt-2.5 text-[11px] leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-800">Dropping it would close: </span>{s.purpose.closes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-100 p-3 text-[11px] leading-relaxed text-slate-600">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Improvements are modelled against the qualifications in this app, so the counts move as the catalogue grows.
        Entry requirements are minimums — institutions often admit above them when places are limited.
      </p>
    </Screen>
  );
}
