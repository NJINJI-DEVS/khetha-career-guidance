// Why a subject matters, and where it is actually used.
//
// Two layers, because learners ask two different questions:
//
//   SUBJECT_PURPOSE   "What is this subject for, and what closes without it?"
//                     General, phase-aware. Used by the Subject Chooser (GET)
//                     and anywhere a subject needs explaining on its own.
//
//   QUAL_SUBJECT_ROLE "I need 60% Maths for this course — used where, exactly?"
//                     Course-specific: the modules it feeds and what you do
//                     with it. Used by the FET course detail screen.
//
// A course with no entry in QUAL_SUBJECT_ROLE falls back to SUBJECT_PURPOSE,
// so nothing renders blank.

export const PHASES = {
  get: {
    key: "get",
    code: "GET",
    name: "General Education and Training",
    grades: "Grades R to 9",
    ends: "Grade 9",
    decision: "Which subjects you take in Grade 10",
    blurb:
      "The phase every South African learner completes. It ends with the single most consequential choice in school: the Grade 10 subject package, which decides what you may apply for three years later.",
  },
  fet: {
    key: "fet",
    code: "FET",
    name: "Further Education and Training",
    grades: "Grades 10 to 12",
    ends: "the National Senior Certificate",
    decision: "Which qualifications your marks actually open",
    blurb:
      "Grades 10 to 12, ending in the NSC. Your subject choice is largely fixed now, so the work is converting marks into an APS and matching that against real entry requirements at universities, universities of technology and TVET colleges.",
  },
};

// ---------------------------------------------------------------------------
// Layer 1: what each subject is for
// ---------------------------------------------------------------------------

export const SUBJECT_PURPOSE = {
  maths: {
    label: "Mathematics",
    aka: "Pure Maths",
    builds: "Algebra, functions, trigonometry, calculus and proof — the language every quantitative degree is taught in.",
    opens: "Engineering, every BSc stream, actuarial science, chartered accountancy, computer science, medicine, architecture.",
    closes: "All BEng and BSc degrees, the CA(SA) route, and most quantitative BCom streams. These do not accept Mathematical Literacy at any mark.",
    getSignal: "Your Grade 9 Mathematics mark is the strongest single predictor of whether Pure Maths is survivable in Grade 10.",
    weight: "critical",
    note: "The most consequential subject choice in South African schooling. Taking it and getting 45% is still worth more than not taking it at all, because the door stays open.",
  },
  mathslit: {
    label: "Mathematical Literacy",
    builds: "Practical numeracy — budgeting, measurement, rates, tax tables, interpreting graphs and plans.",
    opens: "Most diplomas, NCV and N-course programmes, nursing at several institutions, teaching in the foundation phase, law, social work, the humanities.",
    closes: "Engineering, BSc, the CA(SA) route and most quantitative degrees. This is a hard wall, not a high bar.",
    getSignal: "A sensible, honest choice below roughly 45% in Grade 9 Maths — a struggle through Pure Maths to a 35% NSC mark serves nobody.",
    weight: "gateway",
    note: "Not a lesser subject, but a narrower one. Choose it deliberately, knowing what it closes, rather than by default.",
  },
  physci: {
    label: "Physical Sciences",
    builds: "Mechanics, electricity, chemical reactions and stoichiometry — modelling the physical world with mathematics.",
    opens: "Engineering, medicine, pharmacy, geology, chemistry, most artisan trades at N-level.",
    closes: "Every engineering degree and diploma, medicine, pharmacy and most physical-science degrees.",
    getSignal: "Natural Sciences in Grade 9 splits into Physical Sciences and Life Sciences in Grade 10. A strong mark suggests you can carry both.",
    weight: "critical",
    note: "Almost always paired with Pure Maths — the two are taught as though you have the other.",
  },
  lifesci: {
    label: "Life Sciences",
    builds: "Cell biology, human physiology, genetics, ecology and scientific method applied to living systems.",
    opens: "Nursing, medicine, physiotherapy, dietetics, agriculture, environmental science, psychology at several institutions.",
    closes: "Nursing and most health-science degrees. It is the gateway subject for the entire health sector.",
    getSignal: "The other half of Grade 9 Natural Sciences. Generally more accessible than Physical Sciences without strong Maths.",
    weight: "critical",
    note: "Health degrees usually want Life Sciences AND Physical Sciences. Taking only one narrows the list considerably.",
  },
  english: {
    label: "English",
    builds: "Comprehension, argument, academic register and the ability to read a dense text and extract what matters.",
    opens: "Everything. Every qualification in this app lists a language requirement, and most name English specifically.",
    closes: "Nothing outright, but a weak mark caps your APS and blocks institutions that set a language minimum separately.",
    getSignal: "The most portable mark you carry. It is the one subject that lifts every pathway at once.",
    weight: "universal",
    note: "Degrees are assessed in writing. A learner who cannot construct an argument struggles in every faculty, including engineering.",
  },
  accounting: {
    label: "Accounting",
    builds: "Double-entry bookkeeping, financial statements, ratio analysis and the discipline of balancing to the cent.",
    opens: "BCom Accounting, the CA(SA) articles route, financial management diplomas, auditing.",
    closes: "Not strictly required for BCom everywhere, but the CA stream at most universities assumes it and moves fast.",
    getSignal: "Grows directly out of the accounting half of Grade 9 EMS.",
    weight: "important",
    note: "Starting BCom Accounting without school Accounting is possible but means catching up a full year of groundwork in one semester.",
  },
  business: {
    label: "Business Studies",
    builds: "Business environments, entrepreneurship, operations, marketing and management theory.",
    opens: "BCom general and management streams, business management diplomas, N4–N6 business courses.",
    closes: "Rarely a hard requirement — it strengthens an application rather than gating it.",
    getSignal: "The management half of Grade 9 EMS.",
    weight: "supporting",
  },
  economics: {
    label: "Economics",
    builds: "Micro and macroeconomics, markets, inflation, fiscal policy and reading the economy as a system.",
    opens: "BCom Economics, PPE, development studies, public policy, banking and investment routes.",
    closes: "Not usually a hard gate, but economics degrees assume the vocabulary from day one.",
    getSignal: "Extends the economics strand of Grade 9 EMS. Pairs naturally with Pure Maths for quantitative streams.",
    weight: "supporting",
  },
  geography: {
    label: "Geography",
    builds: "Map and GIS work, climatology, geomorphology, settlement and population analysis.",
    opens: "Town planning, environmental management, surveying, GIS, logistics, teaching.",
    closes: "Some surveying and planning programmes list it specifically.",
    getSignal: "The geography half of Grade 9 Social Sciences.",
    weight: "supporting",
  },
  history: {
    label: "History",
    builds: "Source analysis, evidence weighing and sustained written argument — the closest school training to legal reasoning.",
    opens: "Law, journalism, political science, heritage work, teaching.",
    closes: "Rarely a formal requirement, but law faculties read an essay subject as evidence you can argue on paper.",
    getSignal: "The history half of Grade 9 Social Sciences.",
    weight: "supporting",
  },
  it: {
    label: "Information Technology",
    builds: "Programming in Java or Delphi, algorithms, data structures and database design.",
    opens: "BSc Computer Science, IT diplomas, software development.",
    closes: "Nothing — computer science degrees assume no prior programming. It is an advantage, not a gate.",
    getSignal: "Grows out of Grade 9 Technology, but needs Pure Maths alongside it to lead anywhere quantitative.",
    weight: "supporting",
    note: "Frequently confused with CAT. IT teaches you to write software; CAT teaches you to use it.",
  },
  cat: {
    label: "Computer Applications Technology",
    builds: "Spreadsheets, databases, word processing and digital literacy to a professional standard.",
    opens: "Office administration, business diplomas, end-user computing certificates.",
    closes: "It does not substitute for IT on a computer science application.",
    getSignal: "Useful and employable, but not a programming subject.",
    weight: "supporting",
  },
  egd: {
    label: "Engineering Graphics and Design",
    builds: "Technical drawing, orthographic and isometric projection, CAD and reading an engineering drawing.",
    opens: "Engineering degrees and diplomas, architecture, draughting, the built-environment trades.",
    closes: "Not a hard gate, but architecture and draughting programmes weight it heavily.",
    getSignal: "The drawing strand of Grade 9 Technology.",
    weight: "important",
  },
  technical: {
    label: "Technical Sciences",
    builds: "Applied physics and chemistry for technical trades — taught through workshop problems rather than abstraction.",
    opens: "N-courses, NCV engineering programmes, apprenticeships and trade tests.",
    closes: "Does not replace Physical Sciences for a university engineering degree.",
    getSignal: "The applied route through Grade 9 Technology and Natural Sciences.",
    weight: "important",
  },
  art: {
    label: "Visual Arts",
    builds: "Drawing, composition, art history and — critically — a portfolio of finished work.",
    opens: "Fine art, graphic design, architecture, industrial design, animation.",
    closes: "Nothing formally, but design programmes assess a portfolio, and one is hard to build from nothing after Grade 12.",
    getSignal: "Extends Grade 9 Creative Arts.",
    weight: "important",
    note: "The portfolio usually carries more weight than the mark. Start it in Grade 10, not Grade 12.",
  },
  lo: {
    label: "Life Orientation",
    builds: "Study skills, citizenship, health and career planning.",
    opens: "Compulsory for every NSC learner.",
    closes: "Nothing — but note it is excluded from the APS at almost every institution.",
    getSignal: "Compulsory throughout. A strong mark does not lift your APS, so budget your effort accordingly.",
    weight: "compulsory",
    note: "The one subject where a high mark earns you nothing on an application. Do not sacrifice a counting subject for it.",
  },
  agric: {
    label: "Agricultural Sciences",
    builds: "Soil science, animal and plant production, agricultural economics and sustainability.",
    opens: "Agriculture diplomas and degrees, agronomy, animal health, agribusiness.",
    closes: "Agriculture programmes usually want it alongside Life Sciences.",
    getSignal: "A strong regional option where agriculture is the local economy.",
    weight: "important",
  },
  tourism: {
    label: "Tourism",
    builds: "Tourism geography, sustainable travel, customer service and the structure of the industry.",
    opens: "Tourism and hospitality diplomas, guiding, events management.",
    closes: "Rarely a formal gate.",
    weight: "supporting",
  },
};

// ---------------------------------------------------------------------------
// Layer 2: where the subject is used inside a specific qualification
// ---------------------------------------------------------------------------
// `where`   — plain-language: what you actually do with it
// `modules` — named modules the subject feeds, so the link is concrete
// `depth`   — "core" (used throughout) | "foundation" (first year, then
//             assumed) | "applied" (used in practicals and projects)

export const QUAL_SUBJECT_ROLE = {
  q1: { // BSc Computer Science
    maths: {
      where: "Algorithms are analysed mathematically, not by intuition. You prove that a sort is correct and derive how its running time grows before you are allowed to call it efficient.",
      modules: ["Discrete Mathematics", "Linear Algebra", "Analysis of Algorithms"],
      depth: "core",
    },
    english: {
      where: "Specifications, technical documentation and the written defence of a design in your final-year project.",
      modules: ["Software Engineering", "Capstone Project"],
      depth: "foundation",
    },
  },
  q2: { // BCom Accounting (CA stream)
    maths: {
      where: "Present value, annuities, loan amortisation and the time value of money — the arithmetic underneath every valuation you will sign off.",
      modules: ["Financial Management", "Quantitative Techniques"],
      depth: "core",
    },
    accounting: {
      where: "The degree resumes where Grade 12 Accounting stopped, at speed. Consolidations and deferred tax are built directly on double-entry fluency.",
      modules: ["Financial Accounting I–III", "Auditing"],
      depth: "core",
    },
    english: {
      where: "Audit reports, management letters and the professional writing SAICA assesses in the qualifying exams.",
      modules: ["Auditing", "Corporate Governance"],
      depth: "foundation",
    },
  },
  q3: { // Bachelor of Nursing
    lifesci: {
      where: "Anatomy and physiology start at cell structure and the organ systems you met in Grade 11, then move straight to pathology. Pharmacology assumes you know how a kidney clears a drug.",
      modules: ["Anatomy and Physiology", "Pathophysiology", "Pharmacology"],
      depth: "core",
    },
    english: {
      where: "Patient records are legal documents. Ambiguous notes cause harm, and nursing councils treat poor documentation as a disciplinary matter.",
      modules: ["Professional Practice", "Clinical Placement"],
      depth: "core",
    },
  },
  q4: { // Diploma in Information Technology
    maths: {
      where: "Number systems, boolean logic and the basic statistics behind database indexing and query cost.",
      modules: ["Mathematics for IT", "Database Systems"],
      depth: "foundation",
    },
    english: {
      where: "User requirements, system documentation and client-facing handover material.",
      modules: ["Systems Analysis", "Project"],
      depth: "foundation",
    },
  },
  q5: { // National Diploma: Electrical Engineering
    maths: {
      where: "Complex numbers for AC analysis, differential equations for transient response, and phasors throughout. This is the module that fails most first years.",
      modules: ["Mathematics I–III", "Electrotechnics"],
      depth: "core",
    },
    physci: {
      where: "Electromagnetism and circuit theory are a direct continuation of Grade 12 electricity, at a steeper gradient.",
      modules: ["Electrical Engineering I–III", "Electrical Machines"],
      depth: "core",
    },
  },
  q6: { // Diploma in Financial Accounting
    maths: {
      where: "Interest, depreciation schedules and the cost calculations behind management accounting.",
      modules: ["Cost and Management Accounting", "Financial Mathematics"],
      depth: "foundation",
    },
    english: {
      where: "Financial reporting and client correspondence.",
      modules: ["Financial Reporting"],
      depth: "foundation",
    },
  },
  q7: { // N4-N6 Electrical Infrastructure Construction
    maths: {
      where: "Cable sizing, load and voltage-drop calculations, and the trigonometry behind pole and conductor geometry. Applied on the job, not on a page.",
      modules: ["Mathematics N4–N6", "Electrical Trade Theory"],
      depth: "applied",
    },
  },
  q8: { // N4-N6 Business Management
    english: {
      where: "Reports, correspondence and the communication module assessed throughout N4 to N6.",
      modules: ["Communication N4", "Management Communication"],
      depth: "foundation",
    },
  },
  q9: { // NCV Civil Engineering & Building
    maths: {
      where: "Quantities, areas, volumes and setting out. Taught inside the vocational subjects rather than as separate theory.",
      modules: ["Mathematics L2–L4", "Construction Planning"],
      depth: "applied",
    },
  },
  q10: { // BEd Foundation Phase Teaching
    english: {
      where: "You are teaching reading itself. Phonics, emergent literacy and the diagnosis of a struggling reader all rest on your own command of the language.",
      modules: ["Language Teaching Methodology", "Emergent Literacy", "Teaching Practice"],
      depth: "core",
    },
  },
  q11: { // Bachelor of Social Work
    english: {
      where: "Case notes, court reports and statutory documentation. A social worker's written record is evidence in a children's court.",
      modules: ["Social Work Practice", "Fieldwork Practicum"],
      depth: "core",
    },
  },
  q12: { // Diploma in Graphic Design
    english: {
      where: "Concept rationales and client presentations. Designers who cannot explain a decision lose the argument to whoever can.",
      modules: ["Design Theory", "Professional Practice"],
      depth: "foundation",
    },
  },
  q13: { // Diploma in Agricultural Management
    lifesci: {
      where: "Plant and animal physiology, soil biology and the genetics behind breeding and cultivar selection.",
      modules: ["Crop Production", "Animal Production", "Soil Science"],
      depth: "core",
    },
    maths: {
      where: "Yield modelling, feed ratios, input costing and the margin arithmetic that decides whether a season was worth planting.",
      modules: ["Agricultural Economics", "Farm Management"],
      depth: "foundation",
    },
  },
  q14: { // BEng Mechanical Engineering
    maths: {
      where: "Calculus is the working language from week one — differential equations for dynamics, vector calculus for fluids and heat. The 70% entry requirement is a floor, not a target.",
      modules: ["Mathematics I–II", "Dynamics", "Thermodynamics", "Fluid Mechanics"],
      depth: "core",
    },
    physci: {
      where: "Statics, dynamics and thermodynamics continue Grade 12 mechanics directly, with calculus added on top.",
      modules: ["Engineering Mechanics", "Thermodynamics", "Materials Science"],
      depth: "core",
    },
    english: {
      where: "Design reports and the technical writing ECSA assesses on the route to professional registration.",
      modules: ["Engineering Design", "Professional Communication"],
      depth: "foundation",
    },
  },
};

export const DEPTH_LABEL = {
  core: "Used throughout the qualification",
  foundation: "Assumed from first year onward",
  applied: "Used in practicals and workplace training",
};

/** Course-specific role where one exists, otherwise the general purpose. */
export function subjectRoleFor(qualId, subjectKey) {
  return QUAL_SUBJECT_ROLE[qualId]?.[subjectKey] || null;
}
