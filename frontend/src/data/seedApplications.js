// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.
// The seeded SEED_APPLICATIONS array that used to live here was removed when
// AdminApprovals/ApplicationDetail were wired to the real
// MentorApplicationsController — VETTING_GUIDE is static editorial content,
// not activity data, so it stays.

export const VETTING_GUIDE = [
  {
    title: "The documents do not corroborate each other",
    body: "An ID, a transcript and an email address should agree on one person. A surname that changes between them, or a transcript from an institution the email domain does not match, is the most common tell.",
  },
  {
    title: "Credentials that cannot be looked up",
    body: "A registration number is only worth something if you can find it on the council's register. Numbers in the wrong format are invented; numbers in the right format still need checking against SACE, SAICA, ECSA or HPCSA.",
  },
  {
    title: "A free email address doing institutional work",
    body: "Anyone can hold gmail.com under any name. A claim of employment backed only by a personal address is a claim with nothing behind it.",
  },
  {
    title: "Urgency, flattery or pressure to be approved fast",
    body: "Genuine applicants wait. People building access to children often push — asking to be fast-tracked, or following up repeatedly within hours.",
  },
  {
    title: "Wanting to move off the platform, or meet privately",
    body: "Read the application's own wording. Offers to meet learners in person, to message on WhatsApp, or to work without a parent present are the single strongest signal, and they often appear in the applicant's own description of what they offer.",
  },
  {
    title: "Scope that keeps widening",
    body: "Someone qualified in one subject offering to tutor five, or a professional volunteering for any age group, is optimising for contact rather than for teaching.",
  },
  {
    title: "A returning rejected applicant",
    body: "Check the ID and email against previous decisions. Coming back under a new spelling of the same name is routine.",
  },
  {
    title: "What is not evidence of wrongdoing",
    body: "A foreign passport, an unusual name, a gap in employment, a modest qualification, or no LinkedIn. None of these belong in a rejection. Decide on documents and corroboration, never on background.",
  },
];
