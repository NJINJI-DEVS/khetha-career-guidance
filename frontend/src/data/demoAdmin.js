// Demo administrator mode.
//
// SCOPE AND SECURITY — read before changing this.
//
// These credentials grant nothing on the server. The frontend `role` is pure
// navigation state with no enforcement (see Services/AdminAuthorization.cs),
// and every admin endpoint is gated by [Authorize(Policy = "AdminOnly")], which
// checks a Supabase JWT against the user_roles table. A demo admin holds no
// Supabase session at all, so any call to /api/admin/* or
// /api/mentorapplications/pending is refused exactly as it would be for an
// anonymous caller.
//
// This exists so the admin screens can be demonstrated without provisioning a
// real admin account and seeding a live database. It runs entirely on the data
// below. Real administrators are still granted the documented way:
//   INSERT INTO user_roles (user_id, role) VALUES ('<auth-user-id>', 'admin');
//
// To remove for production: delete this file and the DEMO_ADMIN branch in
// AuthScreen.jsx. Nothing else depends on it.

export const DEMO_ADMIN = {
  email: "admin",
  password: "njinji",
};

export const DEMO_ADMIN_SESSION = {
  method: "demo",
  identity: "Demo Administrator",
  demoAdmin: true,
  trustDevice: false,
  consent: { core: true, ncap: true, notify: false, research: false },
  ageGate: { minor: false },
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

export const DEMO_APPLICATIONS = [
  {
    id: "demo-1",
    userId: "demo-u1",
    role: "mentor",
    fullName: "Lerato Dlamini",
    idNumber: "9704125800089",
    idDocumentFilename: "lerato-id.pdf",
    workEmail: "l.dlamini@swgc.co.za",
    institution: "South West Gauteng TVET College",
    linkedIn: "https://linkedin.com/in/leratodlamini",
    licenceBody: "sace",
    licenceNumber: "SACE-1234567",
    partnerCode: "KUTL-2027",
    partnerName: "Kutlwanong Centre for Maths, Science & Technology",
    transcriptFilename: "lerato-transcript.pdf",
    subjects: ["Mathematics", "Physical Sciences"],
    claim: "I have taught Grade 10 to 12 Mathematics at Kutlwanong for six years and coach the Saturday programme in Soweto.",
    submitSeconds: 412,
    submittedAt: daysAgo(2),
    status: "pending",
    riskVerdict: "clear",
    riskScore: 0,
    riskFlags: [],
  },
  {
    id: "demo-2",
    userId: "demo-u2",
    role: "professional",
    fullName: "Sipho Nkosi",
    idNumber: "8811045012083",
    idDocumentFilename: null,
    workEmail: "siphonkosi88@gmail.com",
    institution: "Eskom",
    linkedIn: "",
    licenceBody: "ecsa",
    licenceNumber: "",
    partnerCode: "",
    partnerName: "",
    transcriptFilename: null,
    subjects: [],
    claim: "Electrical engineer, happy to advise learners on the engineering route.",
    submitSeconds: 74,
    submittedAt: daysAgo(1),
    status: "pending",
    riskVerdict: "high",
    riskScore: 10,
    riskFlags: [
      { level: "high", title: "No ID document uploaded", detail: "Identity rests entirely on a typed number that nothing corroborates." },
      { level: "high", title: "Free email used as a work address", detail: "siphonkosi88@gmail.com is a personal provider. Anyone can create one in a minute under any name." },
      { level: "high", title: "Registration body claimed with no number", detail: "They selected ECSA but supplied nothing to check." },
      { level: "medium", title: "Application completed unusually fast", detail: "74 seconds. Genuine applicants pause to find documents." },
      { level: "low", title: "No LinkedIn profile", detail: "Most working professionals have one. Weak on its own." },
    ],
  },
  {
    id: "demo-3",
    userId: "demo-u3",
    role: "mentor",
    fullName: "Nomsa Khumalo",
    idNumber: "9502210145087",
    idDocumentFilename: "nomsa-id.pdf",
    workEmail: "nkhumalo@wits.ac.za",
    institution: "University of the Witwatersrand",
    linkedIn: "https://linkedin.com/in/nomsakhumalo",
    licenceBody: "none",
    licenceNumber: "",
    partnerCode: "IKAMVA-2027",
    partnerName: "IkamvaYouth",
    transcriptFilename: "nomsa-transcript.pdf",
    subjects: ["Life Sciences", "English"],
    claim: "Third-year BSc student tutoring through IkamvaYouth since 2025.",
    submitSeconds: 268,
    submittedAt: daysAgo(4),
    status: "pending",
    riskVerdict: "low",
    riskScore: 1,
    riskFlags: [
      { level: "low", title: "Unusual age for the claimed role", detail: "Age 30. Not disqualifying for a peer tutor, but worth a question." },
    ],
  },
  {
    id: "demo-4",
    userId: "demo-u4",
    role: "professional",
    fullName: "Dr Aisha Patel",
    idNumber: "8003155009084",
    idDocumentFilename: "aisha-id.pdf",
    workEmail: "a.patel@up.ac.za",
    institution: "University of Pretoria",
    linkedIn: "https://linkedin.com/in/aishapatel",
    licenceBody: "hpcsa",
    licenceNumber: "MP0123456",
    partnerCode: "",
    partnerName: "",
    transcriptFilename: "aisha-transcript.pdf",
    subjects: ["Life Sciences"],
    claim: "Registered medical practitioner, advising learners considering health sciences.",
    submitSeconds: 530,
    submittedAt: daysAgo(12),
    status: "approved",
    decidedAt: daysAgo(9),
    riskVerdict: "clear",
    riskScore: 0,
    riskFlags: [],
  },
  {
    id: "demo-5",
    userId: "demo-u5",
    role: "mentor",
    fullName: "Johan van Wyk",
    idNumber: "7709085800081",
    idDocumentFilename: null,
    workEmail: "jvw.tutoring@outlook.com",
    institution: "Independent",
    linkedIn: "",
    licenceBody: "sace",
    licenceNumber: "12345",
    partnerCode: "FAKE-9999",
    partnerName: "",
    transcriptFilename: null,
    subjects: [],
    claim: "Available to tutor any subject, any grade. Can meet learners after hours at their homes.",
    submitSeconds: 51,
    submittedAt: daysAgo(20),
    status: "rejected",
    decidedAt: daysAgo(19),
    riskVerdict: "high",
    riskScore: 16,
    riskFlags: [
      { level: "high", title: "No ID document uploaded", detail: "Nothing corroborates the identity claimed." },
      { level: "high", title: "Registration number is the wrong shape", detail: "SACE numbers are seven digits. \"12345\" cannot be looked up on the register." },
      { level: "high", title: "Partner access code is not recognised", detail: "\"FAKE-9999\" is not on the issued list. Either mistyped, expired, or invented." },
      { level: "high", title: "Wants to meet learners privately", detail: "Offers to meet at learners' homes after hours, with no parent or institution named." },
      { level: "medium", title: "Scope that keeps widening", detail: "Offers any subject at any grade, which optimises for contact rather than for teaching." },
      { level: "medium", title: "Application completed unusually fast", detail: "51 seconds." },
    ],
  },
];

export const DEMO_ANALYTICS = {
  totalMatriculants: 1284,
  matriculantsByProvince: [
    { province: "Gauteng", count: 486 },
    { province: "KwaZulu-Natal", count: 274 },
    { province: "Eastern Cape", count: 188 },
    { province: "Western Cape", count: 151 },
    { province: "Limpopo", count: 96 },
    { province: "Mpumalanga", count: 89 },
  ],
  averageAps: 27.4,
  pendingApplications: 3,
  approvedMentors: 41,
  rejectedApplications: 7,
  pendingHelpRequests: 34,
  acceptedHelpRequests: 212,
  declinedHelpRequests: 19,
  recommendationLettersIssued: 58,
  verificationMix: [
    { method: "Institutional partner", count: 22 },
    { method: "Professional register", count: 12 },
    { method: "Work email domain", count: 7 },
  ],
};
