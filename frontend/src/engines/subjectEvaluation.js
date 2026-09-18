// FET phase: evaluates the subjects a learner is actually taking.
//
// The Subject Chooser answers "which package should I pick?" for a Grade 9.
// This is its Grade 10–12 counterpart and answers the questions that replace
// it once the package is fixed: what is each of my subjects doing for me, which
// one is holding me back, and if I could lift one mark, which would it be?
//
// That last question is the one learners ask most and get answered least. It is
// computed here rather than guessed: raise each subject in turn, recount the
// qualifications that become reachable, and rank by what actually opens.

import { QUALIFICATIONS } from '../data/qualifications';
import { SUBJECT_PURPOSE } from '../data/subjectRoles';
import { SUBJECT_LABELS } from '../data/subjects';
import { toLevel, bandLabel } from './levels';
import { eligibility } from './subjects';

export const PERFORMANCE = {
  strong:  { key: "strong",  label: "Strong",        tone: "green", min: 70 },
  solid:   { key: "solid",   label: "Solid",         tone: "blue",  min: 55 },
  passing: { key: "passing", label: "Passing",       tone: "gold",  min: 40 },
  atRisk:  { key: "atRisk",  label: "At risk",       tone: "red",   min: 0 },
};

export const bandFor = (pct) =>
  pct >= 70 ? PERFORMANCE.strong
    : pct >= 55 ? PERFORMANCE.solid
    : pct >= 40 ? PERFORMANCE.passing
    : PERFORMANCE.atRisk;

/** APS from a marks map: best six NSC levels, Life Orientation excluded. */
export function apsFrom(subjects) {
  return subjects
    .filter((s) => !s.excluded)
    .map((s) => toLevel(s.pct))
    .sort((a, b) => b - a)
    .slice(0, 6)
    .reduce((a, b) => a + b, 0);
}

const marksMap = (subjects) => Object.fromEntries(subjects.map((s) => [s.key, s.pct]));

function eligibleSet(subjects, mathsIsPure) {
  const ctx = { aps: apsFrom(subjects), marks: marksMap(subjects), mathsIsPure };
  return new Set(QUALIFICATIONS.filter((q) => eligibility(q, ctx).eligible).map((q) => q.id));
}

/**
 * Per-subject evaluation: what it counts for, what it unlocks, and where it is
 * the specific thing standing between the learner and a qualification.
 */
export function evaluateSubjects({ subjects, mathsIsPure }) {
  const marks = marksMap(subjects);
  const aps = apsFrom(subjects);
  const ctx = { aps, marks, mathsIsPure };

  // Which six subjects are actually carrying the APS
  const counting = new Set(
    subjects
      .filter((s) => !s.excluded)
      .slice()
      .sort((a, b) => toLevel(b.pct) - toLevel(a.pct))
      .slice(0, 6)
      .map((s) => s.key)
  );

  return subjects.map((s) => {
    const level = toLevel(s.pct);

    // Qualifications this subject is named in, split by whether the mark clears it
    const unlocks = [];
    const blocks = [];
    QUALIFICATIONS.forEach((q) => {
      const needed = q.requires[s.key];
      if (needed === undefined) return;
      if (s.pct >= needed) {
        // Only counts as "unlocked by this subject" if nothing else blocks it
        if (eligibility(q, ctx).eligible) unlocks.push(q);
      } else {
        blocks.push({ qual: q, needed, gap: needed - s.pct });
      }
    });

    return {
      ...s,
      level,
      band: bandFor(s.pct),
      bandLabel: bandLabel(s.pct),
      countsToAps: !s.excluded && counting.has(s.key),
      excludedReason: s.excluded
        ? "Life Orientation is excluded from the APS at almost every institution."
        : !counting.has(s.key)
          ? "Outside your best six, so it is not adding to your APS — though it may still be a named requirement."
          : null,
      purpose: SUBJECT_PURPOSE[s.key] || null,
      unlocks,
      blocks: blocks.sort((a, b) => a.gap - b.gap),
    };
  });
}

/**
 * "If I could lift one mark, which one?" — simulates realistic improvements and
 * ranks by how many qualifications actually become reachable. Only subjects
 * where extra effort changes the outcome are returned.
 */
export function improvementLevers({ subjects, mathsIsPure, steps = [5, 10, 15] }) {
  const baseline = eligibleSet(subjects, mathsIsPure);
  const levers = [];

  subjects.forEach((s) => {
    if (s.pct >= 100) return;
    for (const step of steps) {
      const to = Math.min(100, s.pct + step);
      const raised = subjects.map((x) => (x.key === s.key ? { ...x, pct: to } : x));
      const after = eligibleSet(raised, mathsIsPure);
      const gained = [...after].filter((id) => !baseline.has(id));

      if (gained.length > 0) {
        levers.push({
          key: s.key,
          label: s.label || SUBJECT_LABELS[s.key] || s.key,
          from: s.pct,
          to,
          step,
          apsGain: apsFrom(raised) - apsFrom(subjects),
          unlocks: QUALIFICATIONS.filter((q) => gained.includes(q.id)),
        });
        break; // report the smallest step that achieves something
      }
    }
  });

  return levers.sort(
    (a, b) => b.unlocks.length - a.unlocks.length || a.step - b.step
  );
}

/**
 * The qualifications closest to being reachable, with what is still missing.
 * Matters most when no single subject unlocks anything — the honest answer is
 * then "here is what you are actually near, and what stands in the way", rather
 * than an empty panel.
 */
export function nearMisses({ subjects, mathsIsPure, limit = 4 }) {
  const ctx = { aps: apsFrom(subjects), marks: marksMap(subjects), mathsIsPure };

  return QUALIFICATIONS
    .map((q) => {
      const { eligible, unmet } = eligibility(q, ctx);
      if (eligible) return null;
      // A blocked-by-Pure-Maths course is not "near" — it is a different path
      const hardBlocked = q.pureMathsOnly && !mathsIsPure;
      const apsGap = Math.max(0, q.minAPS - ctx.aps);
      const subjectGap = Object.entries(q.requires).reduce((acc, [k, min]) => {
        const got = ctx.marks[k];
        return acc + (got === undefined ? min : Math.max(0, min - got));
      }, 0);
      return { qual: q, unmet, apsGap, subjectGap, hardBlocked, distance: apsGap * 2 + subjectGap };
    })
    .filter((x) => x && !x.hardBlocked)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/** Headline counts for the evaluation summary. */
export function evaluationSummary({ subjects, mathsIsPure }) {
  const aps = apsFrom(subjects);
  const eligible = eligibleSet(subjects, mathsIsPure);
  const counted = subjects.filter((s) => !s.excluded).length;
  const atRisk = subjects.filter((s) => s.pct < 40).length;

  return {
    aps,
    eligibleCount: eligible.size,
    totalQuals: QUALIFICATIONS.length,
    subjectCount: subjects.length,
    countedCount: Math.min(6, counted),
    atRisk,
    mathsIsPure,
  };
}
