// Extracted from App.jsx (Stage 2 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { QUALIFICATIONS } from '../data/qualifications';
import { providerById } from '../data/providers';
import { SUBJECT_LABELS } from '../data/subjects';

// buildSmsSummary looks up saved qualifications by id; QUALIFICATIONS lives
// in src/data/qualifications.js post Stage 1, so this lookup is rebuilt here
// (App.jsx keeps its own copy for the components that stayed behind).
const qualById = Object.fromEntries(QUALIFICATIONS.map((q) => [q.id, q]));

/* ==================================================================
   SMS summary — everything a learner needs if the app is gone
   ================================================================== */

export function buildSmsSummary({ learner, aps, matched, packages, profile }) {
  const first = learner.name.split(" ")[0];
  const lines = [];

  lines.push(`KHETHA PLAN — ${first}, Gr${learner.grade}`);
  if (learner.grade >= 10) lines.push(`APS ${aps}`);

  if (profile.careerChoice) {
    const code = profile.careerChoice.code.join("");
    const top = profile.careerChoice.matches.slice(0, 2).map((m) => m.title).join(", ");
    lines.push(`Interests ${code}: ${top}`);
  }
  if (profile.jobFit) {
    const jf = profile.jobFit.matches[0];
    lines.push(`Best fit: ${jf.title} ${jf.fit}%`);
  }
  if (packages) {
    lines.push(`Gr10 subjects: ${packages[0].subjects.map((s) => (SUBJECT_LABELS[s] || s).split(" ")[0]).join(", ")}`);
  }

  if (matched.length) {
    lines.push("YOU QUALIFY FOR:");
    matched.slice(0, 3).forEach((m, i) => {
      const p = providerById[m.providerId];
      lines.push(`${i + 1}. ${m.title} - ${p.name.split(" ").slice(0, 3).join(" ")} (APS${m.minAPS}, close ${m.deadline})`);
    });
  } else {
    lines.push("No course matches yet - see a Khetha advisor");
  }

  const saved = profile.favourites.filter((id) => qualById[id]).slice(0, 2);
  if (saved.length) {
    lines.push(`Saved: ${saved.map((id) => `${qualById[id].title} (close ${qualById[id].deadline})`).join("; ")}`);
  }

  lines.push("NSFAS: apply nsfas.org.za Sep-Jan, household under R350k");
  lines.push("Help: Khetha 086 999 0123");

  return lines.join("\n");
}
