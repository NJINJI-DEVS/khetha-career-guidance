// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const NSC_BANDS = [
  { level: 7, min: 80, label: "Outstanding" },
  { level: 6, min: 70, label: "Meritorious" },
  { level: 5, min: 60, label: "Substantial" },
  { level: 4, min: 50, label: "Adequate" },
  { level: 3, min: 40, label: "Moderate" },
  { level: 2, min: 30, label: "Elementary" },
  { level: 1, min: 0, label: "Not achieved" },
];

export const SUBJECT_LABELS = {
  maths: "Mathematics", mathslit: "Mathematical Literacy", english: "English",
  physci: "Physical Sciences", lifesci: "Life Sciences", accounting: "Accounting",
  business: "Business Studies", economics: "Economics", geography: "Geography",
  it: "Information Technology", egd: "Engineering Graphics & Design",
  technical: "Technical Sciences", isizulu: "isiZulu", lo: "Life Orientation",
  history: "History", art: "Visual Arts", tourism: "Tourism",
  consumer: "Consumer Studies", agric: "Agricultural Sciences",
};
