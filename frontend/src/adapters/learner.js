// Maps the real backend Matriculant shape (backend/Models/Matriculant.cs) into the
// `learner` shape every screen already consumes (Dashboard, OfflineCentre,
// SmsSummaryModal, OcrScanModal, MentorHub, RequestLetterModal, DesktopShell) —
// this keeps the blast radius of "replace demo data with real data" to the
// data-sourcing layer instead of rewriting every consumer.
//
// gr9Marks is always null here: a real user's onboarding always collects NSC
// (Grade 10-12 style) subjects, never Grade 9 pre-subject-choice marks — the one
// place that used to read gr9Marks (Dashboard's "recommended packages" preview)
// degrades gracefully to null, and Subject Chooser never read it at all.

// ApsCalculator special-cases key === "maths" to swap the displayed label
// between "Mathematics"/"Mathematical Literacy" depending on the stream toggle —
// both real subject names must map to that same key, not two separate rows.
export function keyForSubject(subjectName) {
  const n = (subjectName || "").toLowerCase();
  if (n.startsWith("mathematic")) return "maths";
  return n.replace(/[^a-z0-9]+/g, "");
}

export function subjectToDisplay(s) {
  return {
    key: keyForSubject(s.subjectName),
    label: s.subjectName,
    pct: s.percentage,
    excluded: /life orientation/i.test(s.subjectName || ""),
  };
}

export function matriculantToLearner(matriculant) {
  if (!matriculant) return null;

  const subjects = matriculant.subjects?.length
    ? matriculant.subjects.map(subjectToDisplay)
    : null;

  return {
    id: matriculant.id,
    name: matriculant.fullName,
    grade: matriculant.grade ?? null,
    school: matriculant.school || "",
    province: matriculant.province || "",
    gr9Marks: null,
    subjects,
  };
}
