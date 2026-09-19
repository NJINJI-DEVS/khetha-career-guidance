// CV completeness.
//
// Weighted by what actually costs a learner an interview, not by how many boxes
// are filled. Contact details are weighted hardest because a CV an employer
// cannot reply to is worth nothing at all, no matter how good the rest is — and
// a missing or wrong phone number is the single most common fault in entry-level
// CVs. References carry real weight for the same reason: with no work record,
// a referee is the only thing an employer can verify.

export const EMPTY_CV = {
  personal: { fullName: "", phone: "", email: "", province: "", city: "", idNumber: "", driversLicence: "" },
  summary: { text: "" },
  education: { school: "", matricYear: "", subjects: [], tertiary: [] },
  experience: [],
  skills: { hard: [], soft: [] },
  languages: [],
  references: [],
};

const has = (v) => typeof v === "string" ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : !!v;

/**
 * Each section returns 0-1 complete, and carries a `fix` the UI can show as an
 * action prompt. The prompts are deliberately specific — "Add a phone number an
 * employer can actually reach you on" beats "Section incomplete".
 */
const SECTIONS = [
  {
    key: "contact",
    label: "Contact details",
    weight: 25,
    step: 0,
    score: (cv) => {
      const p = cv.personal || {};
      const parts = [has(p.fullName), has(p.phone), has(p.email) || has(p.city)];
      return parts.filter(Boolean).length / parts.length;
    },
    fix: (cv) => {
      const p = cv.personal || {};
      if (!has(p.fullName)) return "Add your full name as it appears on your ID.";
      if (!has(p.phone)) return "Add a phone number an employer can actually reach you on.";
      if (!has(p.email) && !has(p.city)) return "Add an email address, or at least the town you live in.";
      return null;
    },
  },
  {
    key: "summary",
    label: "Personal summary",
    weight: 15,
    step: 1,
    score: (cv) => {
      const t = (cv.summary?.text || "").trim();
      if (!t) return 0;
      // An opener with its blanks still in it is worse than no summary at all —
      // it tells an employer the learner did not read what they sent. Never
      // scores as complete.
      if (/\{[^}]+\}/.test(t)) return 0.4;
      // Two lines is the useful length. One sentence reads as an afterthought.
      return t.length >= 120 ? 1 : t.length >= 40 ? 0.6 : 0.3;
    },
    fix: (cv) => {
      const t = (cv.summary?.text || "").trim();
      if (!t) return "Write two lines about who you are and what you are looking for.";
      const blanks = t.match(/\{[^}]+\}/g);
      if (blanks) return `Replace ${blanks.slice(0, 2).join(" and ")} in your summary with your own words.`;
      if (t.length < 120) return "Your summary is short — say what you want to do next, not only what you have done.";
      return null;
    },
  },
  {
    key: "education",
    label: "Education",
    weight: 20,
    step: 2,
    score: (cv) => {
      const e = cv.education || {};
      const parts = [has(e.school), has(e.matricYear), (e.subjects || []).length >= 4];
      return parts.filter(Boolean).length / parts.length;
    },
    fix: (cv) => {
      const e = cv.education || {};
      if (!has(e.school)) return "Add the school you attend or attended.";
      if (!has(e.matricYear)) return "Add the year you finish or finished matric.";
      if ((e.subjects || []).length < 4) return "List at least your main subjects — employers read them.";
      return null;
    },
  },
  {
    key: "experience",
    label: "Experience",
    weight: 20,
    step: 3,
    score: (cv) => {
      const xs = cv.experience || [];
      if (xs.length === 0) return 0;
      const described = xs.filter((x) => (x.bullets || []).some((b) => (b || "").trim().length > 10));
      // Having an entry counts for something; describing it is what counts most.
      return Math.min(1, 0.4 + (described.length / Math.max(1, xs.length)) * 0.6);
    },
    fix: (cv) => {
      const xs = cv.experience || [];
      if (xs.length === 0) return "Add anything you have done — part-time work, family business, a school role, caring for family.";
      const undescribed = xs.find((x) => !(x.bullets || []).some((b) => (b || "").trim().length > 10));
      if (undescribed) return `Say what you actually did at "${undescribed.title || "your entry"}" — one or two lines.`;
      return null;
    },
  },
  {
    key: "skills",
    label: "Skills",
    weight: 10,
    step: 4,
    score: (cv) => {
      const s = cv.skills || {};
      const total = (s.hard || []).length + (s.soft || []).length;
      return Math.min(1, total / 6);
    },
    fix: (cv) => {
      const s = cv.skills || {};
      const total = (s.hard || []).length + (s.soft || []).length;
      if (total === 0) return "Add a few skills — practical ones and people ones both count.";
      if (total < 6) return "Add a couple more skills to round the section out.";
      return null;
    },
  },
  {
    key: "languages",
    label: "Languages",
    weight: 5,
    step: 5,
    score: (cv) => Math.min(1, (cv.languages || []).length / 2),
    fix: (cv) =>
      (cv.languages || []).length === 0
        ? "Add your languages. In South Africa this genuinely affects who gets hired."
        : null,
  },
  {
    key: "references",
    label: "References",
    weight: 5,
    step: 5,
    score: (cv) => Math.min(1, (cv.references || []).length / 2),
    fix: (cv) =>
      (cv.references || []).length === 0
        ? "Add one or two referees. With no work history, this is what an employer can check."
        : null,
  },
];

export function scoreCv(cv) {
  const safe = cv || EMPTY_CV;
  const sections = SECTIONS.map((s) => {
    const ratio = Math.max(0, Math.min(1, s.score(safe)));
    return {
      key: s.key,
      label: s.label,
      step: s.step,
      weight: s.weight,
      ratio,
      earned: ratio * s.weight,
      complete: ratio >= 0.999,
      fix: s.fix(safe),
    };
  });

  const total = Math.round(sections.reduce((a, s) => a + s.earned, 0));

  return {
    total,
    sections,
    // Ordered by what buys the most completeness per unit of effort, so the
    // first prompt a learner sees is the one most worth doing.
    actions: sections
      .filter((s) => s.fix)
      .sort((a, b) => (b.weight * (1 - b.ratio)) - (a.weight * (1 - a.ratio)))
      .map((s) => ({ key: s.key, label: s.label, step: s.step, fix: s.fix })),
    band: total >= 85 ? "Ready to send" : total >= 60 ? "Nearly there" : total >= 30 ? "Getting started" : "Just begun",
  };
}
