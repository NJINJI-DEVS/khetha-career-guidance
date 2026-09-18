// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.
//
// SUBJECT_LABELS/SUBJECT_CATEGORIES were expanded to the full, official CAPS/
// National Senior Certificate subject list (DBE's National Policy Pertaining
// to the Programme and Promotion Requirements of the NCS Grades R-12, cross-
// referenced against Umalusi's published subject list), not just the ~19
// most-common subjects the app started with. A real learner studying, say,
// Dramatic Arts, Tshivenda Home Language or Marine Sciences couldn't
// previously represent their actual NSC subjects at all.
//
// The original 19 keys are unchanged so nothing that already reads
// SUBJECT_LABELS[key] breaks. Every new subject follows the same short-key
// convention.

export const NSC_BANDS = [
  { level: 7, min: 80, label: "Outstanding" },
  { level: 6, min: 70, label: "Meritorious" },
  { level: 5, min: 60, label: "Substantial" },
  { level: 4, min: 50, label: "Adequate" },
  { level: 3, min: 40, label: "Moderate" },
  { level: 2, min: 30, label: "Elementary" },
  { level: 1, min: 0, label: "Not achieved" },
];

// Category order drives the grouped subject picker (OnboardingScreen).
export const SUBJECT_CATEGORIES = [
  {
    category: "Languages",
    keys: [
      "english", "englishfal",
      "afrikaanshl", "afrikaansfal",
      "isizulu", "isizulufal",
      "isixhosahl", "isixhosafal",
      "sepedihl", "sepedifal",
      "sesothohl", "sesothofal",
      "setswanahl", "setswanafal",
      "isindebelehl", "isindebelefal",
      "siswatihl", "siswatifal",
      "tshivendahl", "tshivendafal",
      "xitsongahl", "xitsongafal",
    ],
  },
  {
    category: "Mathematics",
    keys: ["maths", "mathslit", "techmaths"],
  },
  {
    category: "Sciences",
    keys: ["physci", "lifesci", "technical"],
  },
  {
    category: "Commerce",
    keys: ["accounting", "business", "economics"],
  },
  {
    category: "Humanities and social sciences",
    keys: ["geography", "history", "lo", "religion"],
  },
  {
    category: "Technology",
    keys: ["it", "cat", "egd", "civiltech", "electrical", "mechanical"],
  },
  {
    category: "Agriculture",
    keys: ["agric", "agricmanagement", "agrictech", "marinesci"],
  },
  {
    category: "Arts and culture",
    keys: ["art", "dance", "design", "drama", "music"],
  },
  {
    category: "Services",
    keys: ["consumer", "hospitality", "tourism"],
  },
  {
    category: "Additional languages",
    keys: [
      "french", "german", "portuguese", "spanish", "mandarin", "arabic",
      "hebrew", "hindi", "gujarati", "tamil", "telugu", "urdu", "italian",
      "latin", "moderngreek",
    ],
  },
];

export const SUBJECT_LABELS = {
  // --- Original 19 (unchanged keys) ---
  maths: "Mathematics", mathslit: "Mathematical Literacy", english: "English",
  physci: "Physical Sciences", lifesci: "Life Sciences", accounting: "Accounting",
  business: "Business Studies", economics: "Economics", geography: "Geography",
  it: "Information Technology", egd: "Engineering Graphics & Design",
  technical: "Technical Sciences", isizulu: "isiZulu", lo: "Life Orientation",
  history: "History", art: "Visual Arts", tourism: "Tourism",
  consumer: "Consumer Studies", agric: "Agricultural Sciences",

  // --- Mathematics alternative ---
  techmaths: "Technical Mathematics",

  // --- Humanities ---
  religion: "Religion Studies",

  // --- Technology ---
  cat: "Computer Applications Technology",
  civiltech: "Civil Technology",
  electrical: "Electrical Technology",
  mechanical: "Mechanical Technology",

  // --- Agriculture ---
  agricmanagement: "Agricultural Management Practices",
  agrictech: "Agricultural Technology",
  marinesci: "Marine Sciences",

  // --- Arts and culture ---
  dance: "Dance Studies",
  design: "Design",
  drama: "Dramatic Arts",
  music: "Music",

  // --- Services ---
  hospitality: "Hospitality Studies",

  // --- Official languages: English/Afrikaans Home Language + First
  // Additional Language, and the nine other official languages at both
  // levels (isiZulu's Home Language entry is the original "isizulu" key). ---
  englishfal: "English First Additional Language",
  afrikaanshl: "Afrikaans Home Language",
  afrikaansfal: "Afrikaans First Additional Language",
  isizulufal: "isiZulu First Additional Language",
  isixhosahl: "isiXhosa Home Language",
  isixhosafal: "isiXhosa First Additional Language",
  sepedihl: "Sepedi Home Language",
  sepedifal: "Sepedi First Additional Language",
  sesothohl: "Sesotho Home Language",
  sesothofal: "Sesotho First Additional Language",
  setswanahl: "Setswana Home Language",
  setswanafal: "Setswana First Additional Language",
  isindebelehl: "isiNdebele Home Language",
  isindebelefal: "isiNdebele First Additional Language",
  siswatihl: "Siswati Home Language",
  siswatifal: "Siswati First Additional Language",
  tshivendahl: "Tshivenda Home Language",
  tshivendafal: "Tshivenda First Additional Language",
  xitsongahl: "Xitsonga Home Language",
  xitsongafal: "Xitsonga First Additional Language",

  // --- Additional (non-official) languages, offered at select schools ---
  french: "French First Additional Language",
  german: "German First Additional Language",
  portuguese: "Portuguese First Additional Language",
  spanish: "Spanish First Additional Language",
  mandarin: "Mandarin First Additional Language",
  arabic: "Arabic First Additional Language",
  hebrew: "Hebrew First Additional Language",
  hindi: "Hindi First Additional Language",
  gujarati: "Gujarati First Additional Language",
  tamil: "Tamil First Additional Language",
  telugu: "Telugu First Additional Language",
  urdu: "Urdu First Additional Language",
  italian: "Italian First Additional Language",
  latin: "Latin First Additional Language",
  moderngreek: "Modern Greek First Additional Language",
};

// GET phase (Grades R–9) subjects, as CAPS actually structures them. These are
// the marks the Subject Chooser reads. They are deliberately NOT the same list
// as the FET subjects above: Natural Sciences has not yet split into Physical
// and Life Sciences, Social Sciences still carries both History and Geography,
// and EMS covers what later becomes Accounting, Business Studies and Economics.
export const GET_SUBJECTS = [
  { key: "english", label: "Home Language", hint: "Usually English or your mother tongue" },
  { key: "fal", label: "First Additional Language", hint: "Your second language subject" },
  { key: "maths", label: "Mathematics", hint: "Splits into Mathematics or Mathematical Literacy in Grade 10" },
  { key: "lifesci", label: "Natural Sciences", hint: "Splits into Physical Sciences and Life Sciences" },
  { key: "social", label: "Social Sciences", hint: "Splits into History and Geography" },
  { key: "tech", label: "Technology", hint: "Leads to EGD, Technical Sciences and IT" },
  { key: "ems", label: "Economic & Management Sciences", hint: "Leads to Accounting, Business Studies and Economics" },
  { key: "creative", label: "Creative Arts", hint: "Leads to Visual Arts, Design, Drama and Music" },
  { key: "lo", label: "Life Orientation", hint: "Compulsory, but excluded from your APS later" },
];

// What each GET subject becomes in the FET phase — the continuity a learner
// rarely gets told, and the reason a Grade 9 mark predicts anything at all.
export const GET_TO_FET = {
  english: ["english"],
  fal: ["english"],
  maths: ["maths", "mathslit", "techmaths"],
  lifesci: ["physci", "lifesci", "agric"],
  social: ["history", "geography", "tourism"],
  tech: ["egd", "technical", "it", "cat", "civiltech", "electrical", "mechanical"],
  ems: ["accounting", "business", "economics"],
  creative: ["art", "design", "drama", "music", "dance"],
  lo: ["lo"],
};
