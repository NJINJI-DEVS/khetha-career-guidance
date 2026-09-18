// Writing help for the CV wizard.
//
// Almost all CV advice assumes work history. A Grade 12 leaver has none, and
// the usual result is a half-empty page that reads as "no experience" when the
// learner has in fact run a tuck shop, captained a team, translated for a
// parent at a clinic, or minded three siblings since they were fourteen. The
// content here is written for that learner specifically: it treats school,
// community and household responsibility as experience worth naming, because
// to an employer hiring at entry level it is.

/** Action verbs grouped by what the learner was actually doing. */
export const ACTION_VERBS = {
  leadership: ["Led", "Coordinated", "Captained", "Chaired", "Organised", "Supervised", "Mentored", "Trained"],
  service: ["Assisted", "Supported", "Advised", "Served", "Tutored", "Cared for", "Interpreted", "Welcomed"],
  practical: ["Built", "Repaired", "Installed", "Operated", "Maintained", "Assembled", "Prepared", "Delivered"],
  admin: ["Recorded", "Scheduled", "Filed", "Tracked", "Balanced", "Processed", "Compiled", "Updated"],
  selling: ["Sold", "Promoted", "Marketed", "Negotiated", "Handled", "Managed", "Grew", "Sourced"],
  creative: ["Designed", "Produced", "Photographed", "Wrote", "Edited", "Performed", "Illustrated", "Filmed"],
};

export const VERB_CATEGORY_LABEL = {
  leadership: "Leading people",
  service: "Helping people",
  practical: "Hands-on work",
  admin: "Organising and records",
  selling: "Selling and money",
  creative: "Creative work",
};

/**
 * Bullet patterns, not finished sentences. A learner who pastes a finished
 * bullet has written someone else's CV; one who fills in the blanks has written
 * their own and can defend it in an interview.
 */
export const BULLET_PATTERNS = [
  { pattern: "Led a team of [number] people to [what you achieved]", example: "Led a team of 6 people to run the Grade 12 fundraiser" },
  { pattern: "Handled [what] for [how many] [people or things] each [day/week]", example: "Handled cash takings for about 40 customers each Saturday" },
  { pattern: "Helped [who] with [what], which meant [the result]", example: "Helped Grade 9 learners with maths, which meant 7 of them passed the June exam" },
  { pattern: "Kept [what] accurate and up to date over [period]", example: "Kept the club's attendance register accurate over two full seasons" },
  { pattern: "Fixed or built [what] using [tools or skills]", example: "Repaired household wiring faults using basic electrical tools" },
  { pattern: "Spoke to [who] in [language] to [purpose]", example: "Spoke to patients in isiZulu to help them complete clinic forms" },
];

/** Openers for the summary, so the blank box is never the obstacle. */
export const SUMMARY_PROMPTS = [
  "A Grade 12 learner from {province} who wants to study {field}.",
  "A recent matriculant with strong {subject} marks looking for an entry-level role in {field}.",
  "A hard-working school leaver with experience in {experience}, aiming to qualify as a {career}.",
  "A reliable, punctual matriculant who has {responsibility} and is ready to start work while studying.",
];

/**
 * Experience most learners have but do not think to list. Shown as prompts on
 * the experience step, because the honest answer to "do you have experience?"
 * is usually yes once the question is asked properly.
 */
export const EXPERIENCE_PROMPTS = [
  { label: "Part-time or holiday work", hint: "Shop, salon, car wash, spaza, farm, restaurant, call centre" },
  { label: "Family business", hint: "Helping at a family shop, stall, taxi, workshop or farm" },
  { label: "Care responsibility", hint: "Looking after younger siblings, a grandparent or a relative who is ill" },
  { label: "School leadership", hint: "Prefect, RCL, class rep, team captain, society chair" },
  { label: "Sport and culture", hint: "Team member, coach, choir, dance, drama, debate" },
  { label: "Church or community", hint: "Youth group, Sunday school, community clean-up, soup kitchen, NGO" },
  { label: "Tutoring", hint: "Helping younger learners or classmates with subjects" },
  { label: "Self-taught skills", hint: "Fixing phones, hair, sewing, coding, photography, music production" },
];

/** Soft skills phrased as evidence rather than adjectives. */
export const SOFT_SKILLS = [
  "Communication", "Teamwork", "Problem solving", "Time management", "Reliability",
  "Leadership", "Adaptability", "Attention to detail", "Customer service", "Conflict resolution",
  "Public speaking", "Planning and organising", "Working under pressure", "Listening",
];

export const HARD_SKILL_GROUPS = {
  computer: { label: "Computer", skills: ["Microsoft Word", "Microsoft Excel", "Email", "Internet research", "Data capture", "Typing", "Google Workspace"] },
  technical: { label: "Technical and trade", skills: ["Hand tools", "Power tools", "Basic wiring", "Welding", "Motor mechanics", "Plumbing basics", "Technical drawing"] },
  money: { label: "Money and admin", skills: ["Cash handling", "Point of sale", "Stock taking", "Record keeping", "Basic bookkeeping", "Filing"] },
  care: { label: "Care and service", skills: ["First aid", "Patient care", "Childcare", "Food handling", "Hygiene standards", "Customer care"] },
  creative: { label: "Creative and digital", skills: ["Photography", "Video editing", "Social media", "Graphic design", "Canva", "Poster design"] },
};

/** The eleven official languages, for the languages step. */
export const SA_LANGUAGES = [
  "Afrikaans", "English", "isiNdebele", "isiXhosa", "isiZulu", "Sepedi",
  "Sesotho", "Setswana", "siSwati", "Tshivenda", "Xitsonga", "South African Sign Language",
];

export const LANGUAGE_LEVELS = ["Home language", "Fluent", "Conversational", "Basic"];

/**
 * Referees matter more at entry level than anywhere else in a career, because
 * there is no work record to check instead. This is guidance, not decoration.
 */
export const REFERENCE_GUIDANCE = [
  "A teacher who taught you recently, ideally in a subject relevant to the job.",
  "A coach, pastor, youth leader or community leader who has known you over time.",
  "Anyone you worked for, even informally or for a few weekends.",
  "Ask permission first, and tell them which job you applied for so they are not caught off guard.",
  "Never list a family member — employers discount it immediately.",
];
