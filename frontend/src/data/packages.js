// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { KHETHA } from '../theme/tokens';

export const PACKAGES = {
  stem: {
    key: "stem", title: "Science and technology package", color: KHETHA.blue, onColor: "#FFFFFF",
    subjects: ["maths", "physci", "lifesci", "it"],
    gate: { maths: 60 },
    opens: "BSc, BEng, medicine, IT degrees and engineering diplomas",
    note: "The widest package, but it depends on Pure Mathematics holding up.",
  },
  business: {
    key: "business", title: "Commerce package", color: KHETHA.gold, onColor: KHETHA.ink,
    subjects: ["maths", "accounting", "business", "economics"],
    gate: { maths: 50 },
    opens: "BCom, financial accounting diplomas, N4–N6 business courses",
    note: "Pure Maths keeps the CA route open; Maths Literacy still allows most diplomas.",
  },
  trades: {
    key: "trades", title: "Technical and trades package", color: KHETHA.green, onColor: "#FFFFFF",
    subjects: ["maths", "technical", "egd", "physci"],
    gate: { maths: 45 },
    opens: "N-courses, NCV programmes, apprenticeships and artisan trades",
    note: "The fastest route to a qualification that earns while others still study.",
  },
  social: {
    key: "social", title: "Humanities and services package", color: "#5B4B8A", onColor: "#FFFFFF",
    subjects: ["english", "history", "geography", "lo"],
    gate: { english: 50 },
    opens: "Teaching, social work, law, public administration",
    note: "Language marks carry this package more than mathematics does.",
  },
  health: {
    key: "health", title: "Health sciences package", color: KHETHA.red, onColor: "#FFFFFF",
    subjects: ["lifesci", "physci", "maths", "english"],
    gate: { lifesci: 55, maths: 50 },
    opens: "Nursing, pharmacy, radiography, medicine",
    note: "Life Sciences is the gateway subject; most degrees also want Physical Sciences.",
  },
  creative: {
    key: "creative", title: "Creative and media package", color: "#8C4A6B", onColor: "#FFFFFF",
    subjects: ["art", "english", "it", "business"],
    gate: { english: 50 },
    opens: "Design, media studies, fine art, marketing",
    note: "Build a portfolio from Grade 10 — most institutions weigh it as heavily as marks.",
  },
};
