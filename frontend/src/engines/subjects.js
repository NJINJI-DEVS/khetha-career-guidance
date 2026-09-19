// GET phase: maps a Grade 9 learner's marks onto the Grade 10 subject packages,
// and FET phase: checks a qualification's entry requirements against real marks.

import { PACKAGES, MATHS_REQUIREMENT } from '../data/packages';
import { SUBJECT_LABELS, GET_SUBJECTS } from '../data/subjects';

const GET_LABEL = Object.fromEntries(GET_SUBJECTS.map((s) => [s.key, s.label]));
const labelFor = (key) => GET_LABEL[key] || SUBJECT_LABELS[key] || key;

/* Readiness bands. Deliberately not a pass/fail: a learner short of a gate is
   being told the size of the gap and what to do about it, not being refused. */
export const VERDICT = {
  strong:  { key: "strong",  label: "Strong fit",        tone: "green", blurb: "Your marks already clear what this package expects." },
  viable:  { key: "viable",  label: "Within reach",      tone: "gold",  blurb: "Close enough that focused work in Grade 9 closes the gap." },
  stretch: { key: "stretch", label: "A stretch for now", tone: "red",   blurb: "Possible, but it would mean lifting a mark substantially first." },
};

function verdictFor(readiness, unmetCount) {
  if (readiness >= 75 && unmetCount === 0) return VERDICT.strong;
  if (readiness >= 50) return VERDICT.viable;
  return VERDICT.stretch;
}

/**
 * Scores every package (or just the chosen ones) against Grade 9 marks.
 * Returns the package enriched with gates, readiness, a verdict, and plain
 * statements of what is strong and what is short.
 */
export function chooseSubjects(marks, interests = []) {
  const keys = interests.length ? interests : Object.keys(PACKAGES);

  return keys
    .filter((k) => PACKAGES[k])
    .map((k) => {
      const p = PACKAGES[k];

      const gates = Object.entries(p.gate).map(([subject, min]) => {
        const got = marks[subject] ?? null;
        return {
          subject,
          label: labelFor(subject),
          min,
          got,
          met: got !== null && got >= min,
          gap: got === null ? null : Math.max(0, min - got),
        };
      });

      const met = gates.filter((g) => g.met).length;
      const unmet = gates.filter((g) => !g.met);
      const avgGap = gates.length
        ? gates.reduce((acc, g) => acc + ((g.got ?? 0) - g.min), 0) / gates.length
        : 0;

      const readiness = Math.max(5, Math.min(100, Math.round(60 + avgGap * 2 + met * 12)));

      const strengths = gates
        .filter((g) => g.met)
        .map((g) => `${g.label} at ${g.got}% clears the ${g.min}% this package wants.`);

      const gaps = unmet.map((g) =>
        g.got === null
          ? `${g.label}: no mark entered, so this could not be checked.`
          : `${g.label} needs to come up ${g.gap} point${g.gap === 1 ? "" : "s"}, from ${g.got}% to ${g.min}%.`
      );

      /* Pure Maths packages get an explicit read on the Maths mark, because
         that single number decides whether the package is real for them. */
      const mathsMark = marks.maths ?? null;
      const mathsRule = MATHS_REQUIREMENT[p.mathsRequirement];
      const mathsRisk =
        p.mathsRequirement === "pure" && mathsMark !== null && mathsMark < 50
          ? `This package requires Pure Mathematics, and ${mathsMark}% in Grade 9 makes that a real risk. Lift it before Grade 10 or the package closes on its own.`
          : null;

      return {
        ...p,
        gates,
        met,
        readiness,
        verdict: verdictFor(readiness, unmet.length),
        strengths,
        gaps,
        mathsRule,
        mathsRisk,
        chosen: interests.includes(k),
      };
    })
    .sort((a, b) => b.readiness - a.readiness);
}

/**
 * Checklist A2: flag pathway-blocking choices while there is still time to
 * change them. These are about the learner's marks overall, not one package.
 */
export function pathwayWarnings(marks) {
  const out = [];
  const maths = marks.maths ?? null;
  const sci = marks.lifesci ?? null;
  const eng = marks.english ?? null;

  if (maths !== null && maths < 45) {
    out.push({
      level: "high",
      title: "Pure Mathematics is at risk",
      body: `At ${maths}% in Grade 9, Pure Maths in Grade 10 is likely to be a struggle. Taking Mathematical Literacy instead is an honest choice — but it permanently closes engineering, every BSc, and the chartered accountancy route. Decide this deliberately, with your Maths teacher, before Grade 10 starts.`,
      affects: ["stem", "ict", "health", "business"],
    });
  } else if (maths !== null && maths < 55) {
    out.push({
      level: "medium",
      title: "Mathematics is borderline",
      body: `${maths}% is enough to attempt Pure Maths, but the gap widens in Grade 11 where it gets abstract. Get support in place now rather than in Grade 11. A 45% in Pure Maths still opens more doors than a 70% in Maths Literacy.`,
      affects: ["stem", "ict"],
    });
  }

  if (sci !== null && sci < 50) {
    out.push({
      level: "medium",
      title: "Natural Sciences may close the health route",
      body: `Natural Sciences splits into Physical Sciences and Life Sciences in Grade 10. At ${sci}%, carrying both would be heavy. Life Sciences alone still opens nursing; dropping both closes the health sector entirely.`,
      affects: ["health", "stem", "agri"],
    });
  }

  if (eng !== null && eng < 50) {
    out.push({
      level: "high",
      title: "Language marks cap everything",
      body: `Every qualification in this app sets a language requirement, and English is assessed in every degree regardless of faculty. At ${eng}%, this limits you more broadly than any other single mark — including in engineering, where reports are half the work.`,
      affects: ["social", "education", "creative", "business"],
    });
  }

  return out;
}

/* FET phase: eligibility of a qualification, given APS and NSC subject marks */
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
