// GET phase (General Education and Training) — the Grade 10 subject packages
// a Grade 9 learner is actually choosing between.
//
// Each package carries enough to answer the three questions a learner really
// has: what would I take, what does it open, and what am I giving up. The last
// one is the question schools answer least well, so `closes` is mandatory here.
//
// `subjects` gives each subject a role rather than a flat list:
//   core        — the package is meaningless without it
//   recommended — strongly advised; most target qualifications assume it
//   elective    — a sensible fourth choice that strengthens the package
//
// `mathsRequirement` is called out separately because Pure Maths versus
// Mathematical Literacy is the single decision that closes the most doors.

import { KHETHA } from '../theme/tokens';

export const MATHS_REQUIREMENT = {
  pure: {
    key: "pure",
    label: "Pure Mathematics required",
    tone: "red",
    detail: "Mathematical Literacy closes this package entirely. No mark in Maths Lit substitutes.",
  },
  preferred: {
    key: "preferred",
    label: "Pure Mathematics strongly preferred",
    tone: "gold",
    detail: "Maths Literacy still allows the diploma and N-course routes, but closes the degree ones.",
  },
  either: {
    key: "either",
    label: "Either Mathematics works",
    tone: "green",
    detail: "Mathematical Literacy is accepted across this package. Pure Maths widens it but is not a gate.",
  },
};

export const PACKAGES = {
  stem: {
    key: "stem",
    title: "Science and Engineering",
    short: "Physical sciences, mathematics and the built world",
    color: KHETHA.blue,
    onColor: "#FFFFFF",
    mathsRequirement: "pure",
    subjects: [
      { key: "maths", role: "core", why: "Every engineering and science degree is taught in the language of calculus." },
      { key: "physci", role: "core", why: "Mechanics and electricity continue directly into first-year engineering." },
      { key: "lifesci", role: "elective", why: "Keeps the health and environmental sciences open alongside engineering." },
      { key: "egd", role: "recommended", why: "Technical drawing is assumed by architecture and most engineering diplomas." },
      { key: "it", role: "elective", why: "An advantage for computer science, though never a requirement." },
    ],
    gate: { maths: 60, lifesci: 55 },
    idealMarks: "60%+ in Grade 9 Mathematics and Natural Sciences",
    opens: "BEng and BSc degrees, engineering diplomas, architecture, geology, actuarial science",
    quals: ["q1", "q5", "q14", "q9"],
    closes: "Nothing else meaningfully — this is the widest package on offer. The cost is workload, not options.",
    note: "The widest package available, but it stands or falls on Pure Mathematics holding up through Grade 11. If Maths drops below 50% by mid Grade 11, talk to your teacher early rather than in Grade 12.",
    careers: ["Civil engineer", "Software developer", "Electrician", "Architect", "Data analyst"],
  },

  health: {
    key: "health",
    title: "Health Sciences",
    short: "The body, medicine and clinical care",
    color: KHETHA.red,
    onColor: "#FFFFFF",
    mathsRequirement: "preferred",
    subjects: [
      { key: "lifesci", role: "core", why: "The gateway subject for the entire health sector — nursing, medicine, pharmacy." },
      { key: "physci", role: "recommended", why: "Medicine and pharmacy require it; nursing at many institutions does not." },
      { key: "maths", role: "recommended", why: "Medicine requires Pure Maths. Nursing often accepts Maths Literacy." },
      { key: "english", role: "core", why: "Patient records are legal documents; clinical councils treat poor notes as misconduct." },
    ],
    gate: { lifesci: 55, maths: 50 },
    idealMarks: "55%+ in Natural Sciences, 50%+ in Mathematics",
    opens: "Nursing, pharmacy, radiography, physiotherapy, dietetics, medicine",
    quals: ["q3"],
    closes: "Engineering, if you drop Physical Sciences to carry Life Sciences alone.",
    note: "Life Sciences is the gate. Most degrees want Physical Sciences alongside it, so taking only one narrows the list sharply — nursing stays open, medicine does not.",
    careers: ["Professional nurse", "Pharmacist", "Radiographer", "Physiotherapist", "Dietitian"],
  },

  business: {
    key: "business",
    title: "Commerce and Finance",
    short: "Money, markets and how organisations run",
    color: KHETHA.gold,
    onColor: KHETHA.ink,
    mathsRequirement: "preferred",
    subjects: [
      { key: "accounting", role: "core", why: "The CA route assumes it and moves fast from day one." },
      { key: "business", role: "recommended", why: "Management theory and the operations vocabulary a BCom starts with." },
      { key: "economics", role: "recommended", why: "Economics degrees assume the vocabulary immediately." },
      { key: "maths", role: "core", why: "Pure Maths keeps the CA(SA) and quantitative BCom streams open." },
    ],
    gate: { maths: 50, ems: 55 },
    idealMarks: "50%+ in Mathematics, 55%+ in EMS",
    opens: "BCom in all streams, chartered accountancy, financial management diplomas, N4–N6 business",
    quals: ["q2", "q6", "q8"],
    closes: "Engineering and the health sciences, unless you carry Physical Sciences as a fifth subject.",
    note: "Pure Maths keeps chartered accountancy open. Maths Literacy still allows most business diplomas and every N-course, so this package degrades gracefully — unlike Science and Engineering.",
    careers: ["Chartered accountant", "Financial manager", "Entrepreneur", "Auditor", "Investment analyst"],
  },

  trades: {
    key: "trades",
    title: "Technical Trades and Artisanship",
    short: "Skilled hands-on work with a national shortage behind it",
    color: KHETHA.green,
    onColor: "#FFFFFF",
    mathsRequirement: "either",
    subjects: [
      { key: "technical", role: "core", why: "Applied physics and chemistry taught through workshop problems." },
      { key: "egd", role: "core", why: "You cannot build from a drawing you cannot read." },
      { key: "maths", role: "recommended", why: "N-courses need working numeracy; Maths Literacy is accepted at most colleges." },
      { key: "physci", role: "elective", why: "Keeps the engineering diploma route open later." },
    ],
    gate: { maths: 45, tech: 50 },
    idealMarks: "45%+ in Mathematics, 50%+ in Technology",
    opens: "N-courses, NCV programmes, apprenticeships, trade tests and artisan qualifications",
    quals: ["q7", "q9"],
    closes: "University degree routes, unless you add Pure Maths and Physical Sciences alongside.",
    note: "The fastest route to earning. A qualified artisan is drawing a wage while degree students are still in second year, and South Africa is short of them. Treated as a lesser choice far more often than the labour market justifies.",
    careers: ["Electrician", "Millwright", "Boilermaker", "Diesel mechanic", "Plumber"],
  },

  ict: {
    key: "ict",
    title: "Information and Computing",
    short: "Software, data and digital systems",
    color: "#1E6F8C",
    onColor: "#FFFFFF",
    mathsRequirement: "preferred",
    subjects: [
      { key: "it", role: "core", why: "Programming, algorithms and databases. Note this is not the same subject as CAT." },
      { key: "maths", role: "core", why: "Computer science is a mathematical discipline before it is a practical one." },
      { key: "physci", role: "elective", why: "Needed if you might move toward computer or electronic engineering." },
      { key: "business", role: "elective", why: "Useful for the systems-analysis and product side of the industry." },
    ],
    gate: { maths: 55, tech: 50 },
    idealMarks: "55%+ in Mathematics, 50%+ in Technology",
    opens: "BSc Computer Science, IT diplomas, software development, data analysis, network engineering",
    quals: ["q1", "q4"],
    closes: "Little, provided you keep Pure Maths. Dropping to Maths Literacy leaves the diploma route only.",
    note: "Information Technology and Computer Applications Technology are constantly confused. IT teaches you to write software; CAT teaches you to use it. Only IT leads to a computer science degree — and even then, degrees assume no prior programming, so IT is an advantage rather than a gate.",
    careers: ["Software developer", "Data analyst", "Network engineer", "Systems analyst", "Cybersecurity analyst"],
  },

  social: {
    key: "social",
    title: "Humanities, Law and Public Service",
    short: "People, society, argument and the state",
    color: "#5B4B8A",
    onColor: "#FFFFFF",
    mathsRequirement: "either",
    subjects: [
      { key: "history", role: "core", why: "Source analysis and sustained written argument — the closest school training to legal reasoning." },
      { key: "english", role: "core", why: "Law and the humanities are assessed almost entirely in writing." },
      { key: "geography", role: "recommended", why: "Opens town planning, development studies and environmental management." },
      { key: "economics", role: "elective", why: "Strengthens the public policy and development routes." },
    ],
    gate: { english: 55, social: 55 },
    idealMarks: "55%+ in English and Social Sciences",
    opens: "Law, social work, public administration, political science, journalism, development studies",
    quals: ["q11", "q10"],
    closes: "Engineering, health sciences and chartered accountancy, unless you carry Maths and a science alongside.",
    note: "Language marks carry this package far more than mathematics does. Law faculties read a strong essay subject as evidence you can hold an argument on paper — which is most of what the degree asks.",
    careers: ["Attorney", "Social worker", "Policy analyst", "Journalist", "Public administrator"],
  },

  education: {
    key: "education",
    title: "Education and Teaching",
    short: "Teaching, early childhood and school leadership",
    color: "#2E7D6F",
    onColor: "#FFFFFF",
    mathsRequirement: "either",
    subjects: [
      { key: "english", role: "core", why: "Foundation-phase teaching is the teaching of reading itself." },
      { key: "lo", role: "core", why: "Compulsory, and unusually relevant here — child development is the subject matter." },
      { key: "maths", role: "recommended", why: "Foundation-phase teachers teach numeracy; intermediate-phase Maths teachers are in national shortage." },
      { key: "history", role: "elective", why: "A strong second teaching subject for the senior phase." },
    ],
    gate: { english: 50, social: 50 },
    idealMarks: "50%+ in English",
    opens: "BEd across all phases, teaching diplomas, early childhood development qualifications",
    quals: ["q10"],
    closes: "Little. Teaching accepts a wide range of packages, which is part of its appeal.",
    note: "Funded generously through the Funza Lushaka bursary, which covers full costs in exchange for teaching in a public school. Maths and Science teachers are in the most severe shortage, so that combination is close to guaranteed employment.",
    careers: ["Foundation phase teacher", "Subject teacher", "ECD practitioner", "School principal", "Education specialist"],
  },

  agri: {
    key: "agri",
    title: "Agriculture and Environment",
    short: "Land, food production and natural resources",
    color: "#6B8E23",
    onColor: "#FFFFFF",
    mathsRequirement: "either",
    subjects: [
      { key: "agric", role: "core", why: "Soil, crop and animal production — the technical core of the sector." },
      { key: "lifesci", role: "core", why: "Plant and animal physiology underpin everything in agriculture." },
      { key: "geography", role: "recommended", why: "Climate, water and land use are the constraints the whole sector works within." },
      { key: "maths", role: "recommended", why: "Yields, input costs and margins decide whether a season was worth planting." },
    ],
    gate: { lifesci: 50, maths: 45 },
    idealMarks: "50%+ in Natural Sciences",
    opens: "Agricultural management diplomas, agronomy, animal health, agribusiness, environmental science",
    quals: ["q13"],
    closes: "Little, though dropping Physical Sciences closes environmental engineering.",
    note: "Often the strongest regional option where agriculture is the local economy, and consistently under-chosen relative to the jobs available. Agribusiness in particular pairs well with the commerce subjects.",
    careers: ["Farm manager", "Agronomist", "Animal health technician", "Agricultural economist", "Conservation officer"],
  },

  creative: {
    key: "creative",
    title: "Creative, Design and Media",
    short: "Visual work, communication and making things people see",
    color: "#8C4A6B",
    onColor: "#FFFFFF",
    mathsRequirement: "either",
    subjects: [
      { key: "art", role: "core", why: "The portfolio matters more than the mark, and it takes three years to build." },
      { key: "english", role: "core", why: "Designers who cannot explain a decision lose the argument to whoever can." },
      { key: "it", role: "elective", why: "Opens digital design, animation and front-end development." },
      { key: "business", role: "elective", why: "Most creative careers are freelance, which makes you a small business." },
    ],
    gate: { english: 50, creative: 55 },
    idealMarks: "55%+ in Creative Arts, 50%+ in English",
    opens: "Graphic design, fine art, architecture, industrial design, media studies, animation",
    quals: ["q12"],
    closes: "Engineering and health sciences, unless Maths and a science are carried alongside.",
    note: "Institutions assess a portfolio, and it usually outweighs the marks. Start building it in Grade 10 — a portfolio assembled in Grade 12 looks exactly like one assembled in Grade 12.",
    careers: ["Graphic designer", "Architect", "Animator", "Art director", "Industrial designer"],
  },
};

export const PACKAGE_LIST = Object.values(PACKAGES);

export const SUBJECT_ROLE_STYLE = {
  core: { label: "Core", tone: "green" },
  recommended: { label: "Recommended", tone: "gold" },
  elective: { label: "Elective", tone: "slate" },
};
