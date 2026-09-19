// A learner's own progress — deliberately not a copy of the admin dashboard.
//
// The admin view answers "how is the platform doing". This answers "how am I
// doing, and what should I do next", so every panel ends in an action rather
// than a number. A learner who reads this and does not know what to do next has
// been shown statistics, not guidance.
//
// Everything here is computed from state the app already holds — saved
// questionnaire results, subjects and marks, favourites, the CV document.
// Nothing is invented to fill a panel out.

import { useMemo, useEffect, useState } from 'react';
import {
  Target, FileText, Heart, Route, ChevronRight, CheckCircle2, Circle,
  TrendingUp, AlertTriangle, Sparkles, GraduationCap,
} from 'lucide-react';
import { THEME } from '../../theme/tokens';
import { qualById } from '../../data/qualifications';
import { occById } from '../../data/occupations';
import { eligibility } from '../../engines/subjects';
import { scoreCv } from '../../engines/cvScore';
import { getMyCv } from '../../lib/api';
import { Panel } from '../ui/Panel';
import { SectionTitle } from '../ui/SectionTitle';
import { Pill } from '../ui/Pill';
import { EmptyState } from '../ui/EmptyState';

/* ---- small visuals ------------------------------------------------ */

function Gauge({ value, label, sub, color }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90" role="img"
        aria-label={`${label}: ${pct} percent`}>
        {/* Track drawn from the border token, not text-slate-200: on a dark
            surface a literal slate-200 ring is brighter than the value arc it
            is meant to sit behind. */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--k-border)" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <div className="min-w-0">
        <p className="text-3xl font-bold tabular-nums text-slate-900">{pct}%</p>
        <p className="text-xs font-semibold text-slate-900">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{sub}</p>}
      </div>
    </div>
  );
}

function Meter({ label, value, max = 100, color, right }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-xs text-slate-800">{label}</p>
        <p className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-600">{right}</p>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ---- screen -------------------------------------------------------- */

export function StudentAnalytics({ t, learner, profile, subjects, mathsIsPure, aps, journey, go, isGuest }) {
  const [cv, setCv] = useState(null);
  const [cvState, setCvState] = useState('loading');

  useEffect(() => {
    // A guest has no account, so this would be a guaranteed 401. Skipping it
    // keeps a predictable failure out of the console, where it looks like a bug.
    if (isGuest) { setCvState('none'); return undefined; }
    let live = true;
    getMyCv()
      .then((d) => { if (live) { setCv(d?.payload ? JSON.parse(d.payload) : null); setCvState('ready'); } })
      .catch(() => { if (live) setCvState('none'); });
    return () => { live = false; };
  }, [isGuest]);

  const marks = useMemo(
    () => Object.fromEntries((subjects || []).map((s) => [s.key, s.pct])),
    [subjects]
  );

  /* Assessments completed. `history` records retakes, so a learner can see
     they have done something twice rather than only that it is "done". */
  const assessments = useMemo(() => ([
    { key: 'careerChoice', label: 'Career Choice (interests)', done: !!profile.careerChoice,
      detail: profile.careerChoice ? `Your code: ${profile.careerChoice.code.join('')}` : 'Six questions, about five minutes.',
      route: 'tool:choice' },
    { key: 'jobFit', label: 'Job Fit (work preferences)', done: !!profile.jobFit,
      detail: profile.jobFit ? `Closest match ${profile.jobFit.matches[0].fit}%` : 'Matches how you like to work against real occupations.',
      route: 'tool:fit' },
    { key: 'subjectResult', label: 'Subject Chooser', done: !!profile.subjectResult,
      detail: profile.subjectResult ? `Best fit ${profile.subjectResult.results[0].readiness}% ready` : 'Which Grade 10 subjects open which doors.',
      route: 'tool:chooser' },
    { key: 'aps', label: 'APS calculated', done: (subjects?.length || 0) > 0,
      detail: aps ? `APS ${aps} from ${subjects.length} subjects` : 'Add your marks to see what you qualify for.',
      route: 'tab:aps' },
  ]), [profile, subjects, aps]);

  const doneCount = assessments.filter((a) => a.done).length;
  const assessmentPct = Math.round((doneCount / assessments.length) * 100);

  /* Saved qualifications, scored against real marks. This is the panel that
     turns "I saved 6 courses" into "you qualify for 2 of them". */
  const savedQuals = useMemo(() => {
    return (profile.favourites || [])
      .filter((id) => qualById[id])
      .map((id) => {
        const q = qualById[id];
        const e = eligibility(q, { aps: aps || 0, marks, mathsIsPure });
        const apsPct = q.minAPS > 0 ? Math.min(100, Math.round(((aps || 0) / q.minAPS) * 100)) : 100;
        return { q, e, apsPct };
      })
      .sort((a, b) => b.apsPct - a.apsPct);
  }, [profile.favourites, aps, marks, mathsIsPure]);

  const eligibleCount = savedQuals.filter((s) => s.e.eligible).length;
  const savedCareers = (profile.favourites || []).filter((id) => occById[id]);

  const cvScore = useMemo(() => (cv ? scoreCv(cv) : null), [cv]);

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">Your progress</p>
        <p className="mt-0.5 text-lg font-semibold">
          {learner?.name ? learner.name.split(' ')[0] : 'Your'} journey so far
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { l: 'Steps done', v: `${journey.completed}/${journey.total}` },
            { l: 'APS', v: aps || '—' },
            { l: 'Qualify for', v: `${eligibleCount}/${savedQuals.length || 0}` },
          ].map((s) => (
            <div key={s.l} className="rounded-xl k-bg-00432A-60 p-2.5">
              <p className="text-[10px] k-tx-BFE5D4">{s.l}</p>
              <p className="text-lg font-bold tabular-nums">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- assessments ---- */}
      <Panel title="Career assessments" hint={`${doneCount} of ${assessments.length} done`}>
        <Gauge value={assessmentPct} label="Assessments completed" color={THEME.primary}
          sub={doneCount === assessments.length
            ? 'All done. Your results feed the advisor and every recommendation you see.'
            : 'Each one you finish sharpens what the app recommends.'} />
        <ul className="mt-4 space-y-2">
          {assessments.map((a) => (
            <li key={a.key}>
              <button onClick={() => go(a.route)}
                className="flex w-full items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left">
                {a.done
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                  : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-900">{a.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">{a.detail}</span>
                </span>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {/* ---- saved pathways ---- */}
      <Panel title="Saved qualifications" hint={savedQuals.length ? `${eligibleCount} you qualify for now` : undefined}>
        {savedQuals.length === 0 ? (
          <EmptyState icon={Heart} title="Nothing saved yet"
            body="Save a qualification and this shows how close your marks are to its requirements, subject by subject."
            cta="Browse what to study" onCta={() => go('explore:quals')} />
        ) : (
          <div className="space-y-3.5">
            {savedQuals.map(({ q, e, apsPct }) => (
              <div key={q.id}>
                <Meter label={q.title} value={apsPct} color={e.eligible ? THEME.primary : THEME.gold}
                  right={`APS ${aps || 0}/${q.minAPS}`} />
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {e.eligible
                    ? <Pill tone="green" icon={CheckCircle2}>You qualify</Pill>
                    : e.unmet.slice(0, 3).map((u) => <Pill key={u} tone="gold" icon={AlertTriangle}>{u}</Pill>)}
                </div>
              </div>
            ))}
            <button onClick={() => go('explore:quals')}
              className="text-xs font-semibold k-tx-005A36">Find more that fit your marks</button>
          </div>
        )}
      </Panel>

      {/* ---- CV ---- */}
      <Panel title="Your CV" hint={cvScore ? `${cvScore.total}% complete` : undefined}>
        {cvState === 'loading' && <p className="text-xs text-slate-600">Checking your CV…</p>}
        {cvState !== 'loading' && !cvScore && (
          <EmptyState icon={FileText} title="No CV started"
            body="A CV is what turns a bursary or learnership shortlist into an interview. The builder walks you through it in six steps."
            cta="Start my CV" onCta={() => go('tool:cv')} />
        )}
        {cvScore && (
          <>
            <Gauge value={cvScore.total} label="CV completeness"
              color={cvScore.total >= 80 ? THEME.primary : cvScore.total >= 50 ? THEME.gold : THEME.red}
              sub={cvScore.total >= 80
                ? 'Strong enough to send. Keep it updated as you do more.'
                : 'Finish the sections below — each one makes a real difference to a reader.'} />
            {cvScore.actions.length > 0 && (
              <ul className="mt-4 space-y-2">
                {cvScore.actions.slice(0, 4).map((a) => (
                  <li key={a.key}>
                    <button onClick={() => go('tool:cv')}
                      className="flex w-full items-start gap-2.5 rounded-xl k-bd-E4CE8A k-bg-FBF5E7 border p-3 text-left">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 k-tx-6B5307" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-slate-900">{a.label}</span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-700">{a.fix}</span>
                      </span>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => go('tool:cv')}
              className="mt-3 text-xs font-semibold k-tx-005A36">Open the CV builder</button>
          </>
        )}
      </Panel>

      {/* ---- journey / milestones ---- */}
      <Panel title="Milestones" hint={`${journey.completed} of ${journey.total}`}>
        <Meter label="Your career journey" value={journey.completed} max={journey.total}
          color={THEME.blue} right={`${journey.completed}/${journey.total}`} />
        <ul className="mt-3 space-y-2">
          {journey.steps.map((s) => (
            <li key={s.key} className="flex items-start gap-2.5">
              {s.complete
                ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
              <span className={`text-xs leading-relaxed ${s.complete ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                {t(s.labelKey)}
              </span>
            </li>
          ))}
        </ul>
        {journey.next && (
          <button onClick={() => go(journey.next.route)}
            className="mt-3 flex w-full items-center gap-2 rounded-xl k-bg-005A36 px-3 py-2.5 text-xs font-semibold text-white">
            <Route className="h-4 w-4" />Next: {t(journey.next.labelKey)}
          </button>
        )}
      </Panel>

      {/* ---- saved careers ---- */}
      {savedCareers.length > 0 && (
        <div>
          <SectionTitle hint={`${savedCareers.length} saved`}>Careers you are watching</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {savedCareers.map((id) => (
              <button key={id} onClick={() => go(`career:${id}`)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-800">
                {occById[id].title}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600">
        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Everything here is worked out from what you have saved on this account. Nothing on this page is shared with
        anyone — mentors and administrators cannot see it.
      </p>
    </div>
  );
}
