// Extracted from App.jsx (Stage 2 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { PACKAGES } from '../data/packages';
import { SUBJECT_LABELS } from '../data/subjects';

/* R2: Subject Chooser — maps chosen career fields to the CAPS subjects
   those pathways require, then checks them against Grade 9 marks. */

export function chooseSubjects(marks, interests) {
  const keys = interests.length ? interests : Object.keys(PACKAGES);
  return keys
    .map((k) => {
      const p = PACKAGES[k];
      const gates = Object.entries(p.gate).map(([subject, min]) => {
        const got = marks[subject] ?? marks[subject === "lifesci" ? "science" : subject] ?? null;
        return { subject, min, got, met: got !== null && got >= min };
      });
      const met = gates.filter((g) => g.met).length;
      const avgGap = gates.reduce(
        (acc, g) => acc + ((g.got ?? 0) - g.min),
        0
      ) / gates.length;
      const readiness = Math.max(
        5,
        Math.min(100, Math.round(60 + avgGap * 2 + met * 12))
      );
      return { ...p, gates, met, readiness, chosen: interests.includes(k) };
    })
    .sort((a, b) => b.readiness - a.readiness);
}

/* Eligibility of a qualification, given APS and subject marks */
export function eligibility(qual, { aps, marks, mathsIsPure }) {
  const unmet = [];
  if (aps < qual.minAPS) unmet.push(`APS ${qual.minAPS}+ needed`);
  if (qual.pureMathsOnly && !mathsIsPure) unmet.push("Pure Maths required");
  Object.entries(qual.requires).forEach(([key, min]) => {
    const got = marks[key];
    if (got === undefined || got < min)
      unmet.push(`${SUBJECT_LABELS[key] || key} ${min}%+`);
  });
  return { eligible: unmet.length === 0, unmet };
}
