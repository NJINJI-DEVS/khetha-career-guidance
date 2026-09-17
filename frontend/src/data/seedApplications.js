// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const SEED_APPLICATIONS = [
  {
    id: "a1", role: "mentor", status: "pending", submitted: "3 hours ago",
    fullName: "Lerato Mokoena", idNumber: "9202204800083", idDoc: "id-document.pdf",
    workEmail: "l.mokoena@wits.ac.za", institution: "University of the Witwatersrand",
    linkedin: "linkedin.com/in/leratomokoena", licenceBody: "none", licenceNumber: "",
    partnerCode: "IKAMVA-2027", partnerName: "IkamvaYouth", transcript: "academic-transcript.pdf",
    field: "Mathematics and Physical Sciences", subjects: ["Mathematics", "Physical Sciences"],
    claim: "BSc Actuarial Science, 3rd year, Wits. Tutoring through IkamvaYouth since 2025.",
    submitSeconds: 412,
  },
  {
    id: "a2", role: "professional", status: "pending", submitted: "1 day ago",
    fullName: "Marius van Wyk", idNumber: "8804125800081", idDoc: null,
    workEmail: "mariusvw92@gmail.com", institution: "Independent consultant",
    linkedin: "", licenceBody: "ecsa", licenceNumber: "ENG-2024",
    partnerCode: "", partnerName: null, transcript: null,
    field: "Engineering", subjects: ["Mathematics", "Physical Sciences", "Life Sciences"],
    subjectMismatch: "Life Sciences",
    claim: "15 years as a consulting engineer. Happy to mentor learners one-on-one, evenings and weekends.",
    submitSeconds: 38,
  },
  {
    id: "a3", role: "mentor", status: "pending", submitted: "2 days ago",
    fullName: "Nomvula Zikode", idNumber: "0104125012088", idDoc: "id-card.jpg",
    workEmail: "nomvula.z@swgc.edu.za", institution: "South West Gauteng TVET College",
    linkedin: "linkedin.com/in/nomvula-zikode", licenceBody: "sace", licenceNumber: "20241887",
    partnerCode: "TVET-SRC-2027", partnerName: "TVET College SRC Tutor Corps",
    transcript: "diploma-certificate.pdf",
    field: "Business Studies", subjects: ["Accounting", "Business Studies"],
    claim: "Student support officer at SWGC. SACE registered, previously taught Grade 10 Accounting.",
    submitSeconds: 260,
  },
  {
    id: "a4", role: "professional", status: "pending", submitted: "2 days ago",
    fullName: "Dr T Mahlangu", idNumber: "7712310000000", idDoc: null,
    workEmail: "drmahlangu@medicalcareers-sa.co", institution: "Private practice",
    linkedin: "facebook.com/drmahlangu", licenceBody: "hpcsa", licenceNumber: "999",
    partnerCode: "MEDIC-2027", partnerName: null, transcript: null,
    field: "Health Sciences", subjects: ["Life Sciences"],
    claim: "Doctor offering one-on-one guidance to matriculants applying for medicine. Can meet learners privately.",
    submitSeconds: 22, duplicateOf: "a rejected application from August",
  },
  {
    id: "a5", role: "mentor", status: "approved", submitted: "6 days ago",
    fullName: "Thabo Sithole", idNumber: "0308115012087", idDoc: "id-document.pdf",
    workEmail: "t.sithole@uj.ac.za", institution: "University of Johannesburg",
    linkedin: "linkedin.com/in/thabosithole", licenceBody: "none", licenceNumber: "",
    partnerCode: "KUTL-2027", partnerName: "Kutlwanong Centre for Maths, Science & Technology",
    transcript: "transcript.pdf", field: "Accounting", subjects: ["Accounting", "Business Studies"],
    claim: "BCom Accounting 2nd year, UJ. Kutlwanong alumnus, now tutoring for them.",
    submitSeconds: 330, decidedBy: "DHET verification team", decidedOn: "11 September 2026",
  },
];

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
