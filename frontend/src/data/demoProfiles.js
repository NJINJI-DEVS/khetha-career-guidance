// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const DEMO_PROFILES = {
  sipho: {
    id: "sipho", name: "Sipho Mabaso", grade: 9, track: "A",
    school: "Meadowlands Secondary, Soweto", province: "Gauteng",
    blurb: "Pre-subject choice — deciding his Grade 10 package",
    gr9Marks: { maths: 48, lifesci: 52, ems: 61, english: 58, tech: 55, social: 60 },
    subjects: null,
  },
  thandi: {
    id: "thandi", name: "Thandi Nkosi", grade: 12, track: "B",
    school: "Kagiso High School, Mogale City", province: "Gauteng",
    blurb: "Post-subject choice — applying for first-year study",
    gr9Marks: null,
    subjects: [
      { key: "maths", label: "Mathematics", pct: 62 },
      { key: "english", label: "English Home Language", pct: 65 },
      { key: "physci", label: "Physical Sciences", pct: 58 },
      { key: "lifesci", label: "Life Sciences", pct: 68 },
      { key: "accounting", label: "Accounting", pct: 75 },
      { key: "business", label: "Business Studies", pct: 84 },
      { key: "lo", label: "Life Orientation", pct: 72, excluded: true },
    ],
  },
};
