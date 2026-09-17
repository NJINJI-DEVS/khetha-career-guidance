// Extracted from App.jsx (Stage 2 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { RIASEC_TYPES, CAREER_CHOICE_Q } from '../data/assessments';
import { OCCUPATIONS } from '../data/occupations';

/* Career Choice — Holland/RIASEC, the model NCAP's own questionnaire
   is built on. Six types, two statements each. */

export function scoreCareerChoice(answers) {
  const totals = {};
  Object.keys(RIASEC_TYPES).forEach((t) => (totals[t] = 0));
  CAREER_CHOICE_Q.forEach((q) => {
    totals[q.type] += answers[q.id] || 0;
  });
  const ranked = Object.entries(totals)
    .map(([type, raw]) => ({ type, raw, pct: Math.round((raw / 10) * 100) }))
    .sort((a, b) => b.raw - a.raw);
  const code = ranked.slice(0, 3).map((r) => r.type);
  const matches = OCCUPATIONS.map((o) => {
    const hits = o.riasec.filter((t) => code.includes(t)).length;
    const weight = o.riasec.reduce(
      (acc, t) => acc + (code.indexOf(t) === -1 ? 0 : 3 - code.indexOf(t)),
      0
    );
    return { ...o, hits, weight };
  })
    .filter((o) => o.hits > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);
  return { ranked, code, matches };
}
