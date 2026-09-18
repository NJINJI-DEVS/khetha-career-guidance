// Extracted from App.jsx (Stage 2 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { JOB_FIT_Q } from '../data/assessments';
import { OCCUPATIONS } from '../data/occupations';

/* Job Fit — work-context preferences matched against each occupation's
   context vector. Lower distance is a closer fit. */

export function scoreJobFit(answers) {
  const axes = ["people", "data", "things", "outdoors", "routine"];
  const profile = {};
  axes.forEach((a) => {
    const qs = JOB_FIT_Q.filter((q) => q.axis === a);
    const sum = qs.reduce((acc, q) => acc + (answers[q.id] || 0), 0);
    /* 2 questions on a 1-5 scale -> 2..10, normalised to the 0-4 vector */
    profile[a] = Math.round(((sum - 2) / 8) * 4);
  });
  const matches = OCCUPATIONS.map((o) => {
    const distance = axes.reduce(
      (acc, a) => acc + Math.abs(o.context[a] - profile[a]),
      0
    );
    const fit = Math.max(0, Math.round(100 - (distance / 20) * 100));
    return { ...o, fit };
  }).sort((a, b) => b.fit - a.fit);
  return { profile, matches };
}
