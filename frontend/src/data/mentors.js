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

export const MENTORS = [
  { id: "m1", name: "Lerato Mokoena", role: "peer", partner: "ikamva", field: "stem",
    subjects: ["Mathematics", "Physical Sciences"], province: "Gauteng", area: "Soweto",
    studying: "BSc Actuarial Science, 3rd year, Wits", rating: 4.9, sessions: 61, availability: "Weekday evenings",
    bio: "I got 84% for Pure Maths at a no-fee school. I know exactly which topics lose learners marks, because they lost me marks first." },
  { id: "m2", name: "Sibusiso Dlamini", role: "industry", partner: null, field: "stem",
    subjects: ["Information Technology", "Mathematics"], province: "Gauteng", area: "Midrand",
    studying: "Senior Software Engineer, 8 years", rating: 4.8, sessions: 34, availability: "Saturday mornings",
    bio: "Started on a TVET N-diploma and bridged into development. Ask me the Maths Lit question — I lived it.",
    employerVerified: true },
  { id: "m3", name: "Dr Naledi Khumalo", role: "institutional", partner: "src", field: "health",
    subjects: ["Life Sciences", "Physical Sciences"], province: "KwaZulu-Natal", area: "Durban",
    studying: "Lecturer, School of Nursing, DUT", rating: 5.0, sessions: 47, availability: "Thursday afternoons",
    bio: "I sit on the faculty admissions committee. I can tell you what actually gets an application rejected." },
  { id: "m4", name: "Thabo Sithole", role: "peer", partner: "kutlwanong", field: "business",
    subjects: ["Accounting", "Business Studies"], province: "Gauteng", area: "Katlehong",
    studying: "BCom Accounting, 2nd year, UJ", rating: 4.7, sessions: 28, availability: "Weekends",
    bio: "Accounting is a subject you pass by doing questions, not by reading. I will drill you." },
  { id: "m5", name: "Zanele Mbatha", role: "industry", partner: null, field: "trades",
    subjects: ["Electrical Technology", "Technical Sciences"], province: "Gauteng", area: "Germiston",
    studying: "Qualified Electrician, red seal, 6 years", rating: 4.9, sessions: 19, availability: "Weekday evenings",
    bio: "I earn well and I owe none of it to a degree. Ask me about apprenticeships and trade tests.",
    employerVerified: true },
  { id: "m6", name: "Kagiso Ndlovu", role: "institutional", partner: "tvetsrc", field: "social",
    subjects: ["English", "Life Orientation"], province: "Gauteng", area: "Soweto",
    studying: "Student support officer, South West Gauteng TVET", rating: 4.6, sessions: 52, availability: "Weekday mornings",
    bio: "I help learners who did not qualify anywhere work out their next move. There is always a next move." },
];

export const SEED_REQUESTS = [
  { id: "r1", from: "Ayanda Mthembu", grade: 11, mentorId: "m1", subject: "Mathematics",
    goal: "Get Pure Maths above 60% for a BSc application", aps: 26,
    marks: "Maths 47%, Physical Sciences 52%, English 61%",
    need: "I understand the work in class but I freeze in tests and run out of time. I need someone to work through past papers with me.",
    status: "pending", sent: "2 days ago" },
  { id: "r2", from: "Nomsa Radebe", grade: 12, mentorId: "m1", subject: "Physical Sciences",
    goal: "Meet the 50% Physical Sciences gate for a diploma in engineering", aps: 24,
    marks: "Maths 54%, Physical Sciences 43%, English 58%",
    need: "Our school has had no science teacher since March. I am teaching myself from YouTube and I am behind on electricity and magnetism.",
    status: "pending", sent: "5 hours ago" },
];
