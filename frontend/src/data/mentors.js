// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const MENTOR_ROLES = {
  peer: { label: "Verified Peer Tutor", blurb: "A senior student or recent matriculant tutoring the subject you are stuck on." },
  institutional: { label: "Institutional Mentor", blurb: "Staff or a registered mentor at a university, UoT or TVET college." },
  industry: { label: "Industry Professional", blurb: "Someone doing the job, who can tell you what the work is actually like." },
};

export const PARTNERS = [
  { id: "ikamva", name: "IkamvaYouth", kind: "Partner NGO" },
  { id: "kutlwanong", name: "Kutlwanong Centre for Maths, Science & Technology", kind: "Partner NGO" },
  { id: "src", name: "University SRC Peer Tutors", kind: "Student society" },
  { id: "tvetsrc", name: "TVET College SRC Tutor Corps", kind: "Student society" },
];

export const partnerById = Object.fromEntries(PARTNERS.map((p) => [p.id, p]));

// The seeded MENTORS/SEED_REQUESTS arrays that used to live here were removed
// when MentorHub/App.jsx were wired to the real mentors/help-requests API
// (useMentors, useHelpRequests) — this file now only holds static config.
