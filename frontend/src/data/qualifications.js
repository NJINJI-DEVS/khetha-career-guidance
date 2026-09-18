// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const QUALIFICATIONS = [
  { id: "q1", title: "BSc Computer Science", providerId: "p1", nqf: 7, duration: "3 years", minAPS: 34,
    requires: { maths: 60, english: 50 }, pureMathsOnly: true, nsfas: true, deadline: "30 September", field: "stem" },
  { id: "q2", title: "BCom Accounting (CA stream)", providerId: "p2", nqf: 7, duration: "3 years", minAPS: 32,
    requires: { maths: 60, english: 50, accounting: 60 }, pureMathsOnly: true, nsfas: true, deadline: "31 October", field: "business" },
  { id: "q3", title: "Bachelor of Nursing", providerId: "p3", nqf: 8, duration: "4 years", minAPS: 30,
    requires: { lifesci: 60, english: 50 }, pureMathsOnly: false, nsfas: true, deadline: "30 June", field: "health" },
  { id: "q4", title: "Diploma in Information Technology", providerId: "p4", nqf: 6, duration: "3 years", minAPS: 24,
    requires: { maths: 40, english: 40 }, pureMathsOnly: false, nsfas: true, deadline: "30 September", field: "stem" },
  { id: "q5", title: "National Diploma: Electrical Engineering", providerId: "p5", nqf: 6, duration: "3 years", minAPS: 26,
    requires: { maths: 50, physci: 50 }, pureMathsOnly: true, nsfas: true, deadline: "31 August", field: "stem" },
  { id: "q6", title: "Diploma in Financial Accounting", providerId: "p6", nqf: 6, duration: "3 years", minAPS: 25,
    requires: { maths: 40, english: 40 }, pureMathsOnly: false, nsfas: true, deadline: "30 September", field: "business" },
  { id: "q7", title: "N4–N6 Electrical Infrastructure Construction", providerId: "p7", nqf: 5, duration: "18 months + practical", minAPS: 18,
    requires: { maths: 40 }, pureMathsOnly: false, nsfas: true, deadline: "Rolling intake", field: "trades" },
  { id: "q8", title: "N4–N6 Business Management", providerId: "p8", nqf: 5, duration: "18 months", minAPS: 16,
    requires: { english: 40 }, pureMathsOnly: false, nsfas: true, deadline: "Rolling intake", field: "business" },
  { id: "q9", title: "NCV Level 2–4: Civil Engineering & Building", providerId: "p9", nqf: 4, duration: "3 years", minAPS: 15,
    requires: {}, pureMathsOnly: false, nsfas: true, deadline: "15 January", field: "stem" },
  { id: "q10", title: "BEd Foundation Phase Teaching", providerId: "p10", nqf: 7, duration: "4 years", minAPS: 26,
    requires: { english: 50 }, pureMathsOnly: false, nsfas: true, deadline: "11 October", field: "social" },
  { id: "q11", title: "Bachelor of Social Work", providerId: "p2", nqf: 8, duration: "4 years", minAPS: 28,
    requires: { english: 50 }, pureMathsOnly: false, nsfas: true, deadline: "31 October", field: "social" },
  { id: "q12", title: "Diploma in Graphic Design", providerId: "p4", nqf: 6, duration: "3 years", minAPS: 22,
    requires: { english: 40 }, pureMathsOnly: false, nsfas: true, deadline: "30 September", field: "creative" },
  { id: "q13", title: "Diploma in Agricultural Management", providerId: "p5", nqf: 6, duration: "3 years", minAPS: 22,
    requires: { lifesci: 40, maths: 40 }, pureMathsOnly: false, nsfas: true, deadline: "31 October", field: "trades" },
  { id: "q14", title: "BEng Mechanical Engineering", providerId: "p11", nqf: 8, duration: "4 years", minAPS: 38,
    requires: { maths: 70, physci: 70, english: 50 }, pureMathsOnly: true, nsfas: true, deadline: "31 July", field: "stem" },
];

export const qualById = Object.fromEntries(QUALIFICATIONS.map((q) => [q.id, q]));
