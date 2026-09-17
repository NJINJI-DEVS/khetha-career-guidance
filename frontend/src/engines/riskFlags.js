// Extracted from App.jsx (Stage 2 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { FREE_EMAIL, LICENCE_FORMATS } from '../data/validation';
import { checkSaId } from './saId';

/* ---- The flag engine ---------------------------------------------- */
export function riskFlags(app) {
  const flags = [];
  const push = (level, title, detail) => flags.push({ level, title, detail });

  const email = (app.workEmail || "").trim();
  const name = (app.fullName || "").trim().toLowerCase();
  const surname = name.split(/\s+/).slice(-1)[0] || "";

  /* Identity */
  const id = checkSaId(app.idNumber);
  if (app.idNumber && !id.valid && !/^[A-Z0-9]{6,12}$/i.test((app.idNumber || "").trim())) {
    push("high", "ID number does not validate", `The number ${id.reason}. A real SA ID passes a checksum — a fabricated one almost never does.`);
  }
  if (id.valid && id.age !== undefined) {
    if (id.age < 18) {
      push("high", "Applicant is under 18", `The ID gives an age of ${id.age}. Under-18s cannot hold a mentor account that contacts other minors unsupervised.`);
    } else if (id.age < 20 && app.role !== "mentor") {
      push("medium", "Age sits oddly against the claim", `Age ${id.age} against a claim of professional experience. Ask how long they have been working.`);
    }
    if (id.age > 75) {
      push("low", "Unusual age for the claimed role", `Age ${id.age}. Not disqualifying, but worth a question.`);
    }
  }
  if (!app.idDoc) {
    push("high", "No ID document uploaded", "Everything about this identity is self-declared. There is nothing to check the typed details against.");
  }

  /* Email */
  if (!email) {
    push("medium", "No work or academic email", "A free-standing claim of employment with no institutional address behind it.");
  } else if (FREE_EMAIL.test(email)) {
    push("high", "Free email used as a work address", `${email} is a personal provider. Anyone can create one in a minute under any name.`);
  } else {
    const domain = email.split("@")[1] || "";
    const institutional = /\.(ac|edu|gov)\.za$|\.edu$/i.test(domain);
    const claimed = (app.institution || "").toLowerCase();
    const domainRoot = domain.split(".")[0];
    /* An .ac.za or .gov.za address is itself the corroboration, and its short
       form rarely resembles the institution's full name (uj.ac.za against
       "University of Johannesburg"), so only non-institutional domains are
       compared against the stated employer. */
    if (!institutional && claimed && domainRoot) {
      const words = claimed.split(/\s+/).filter((w) => w.length > 3);
      const acronym = claimed.split(/\s+/).map((w) => w[0]).join("");
      const matches = words.some((w) => domainRoot.includes(w.slice(0, 4)) || w.includes(domainRoot))
        || acronym.includes(domainRoot) || domainRoot.includes(acronym);
      if (!matches) {
        push("medium", "Email domain does not match the stated employer",
          `They claim ${app.institution} but write from ${domain}, which is not an institutional address.`);
      }
    }
    const local = (email.split("@")[0] || "").toLowerCase();
    if (!institutional && surname.length > 3 && !local.includes(surname.slice(0, 4)) && !/^\d/.test(local)) {
      push("low", "Email does not carry the applicant's surname",
        `${local}@ against the surname "${surname}". Common with shared addresses, but also with borrowed ones.`);
    }
  }

  /* Credentials */
  if (app.licenceBody && app.licenceBody !== "none") {
    const fmt = LICENCE_FORMATS[app.licenceBody];
    const num = (app.licenceNumber || "").trim();
    if (!num) {
      push("high", "Registration body claimed with no number", `They selected ${app.licenceBody.toUpperCase()} but supplied nothing to check.`);
    } else if (fmt && !fmt.re.test(num)) {
      push("high", "Registration number is the wrong shape", `${fmt.hint}. "${num}" does not match, so it cannot be looked up on the council register.`);
    } else {
      push("low", "Registration number needs a register check", `Format is right. Confirm ${num} on the ${app.licenceBody.toUpperCase()} register before approving.`);
    }
  } else if (app.claimsTeacher) {
    push("high", "Claims to teach with no SACE registration", "Every practising educator in South Africa must be SACE registered. Its absence is the single loudest signal here.");
  }

  if (!app.transcript && !app.licenceNumber) {
    push("medium", "No qualification evidence at all", "No transcript, no certificate, no registration number. The stated qualification rests entirely on their word.");
  }

  if (app.partnerCode && !app.partnerName) {
    push("high", "Partner access code is not recognised", `"${app.partnerCode}" is not on the issued list. Either mistyped, expired, or invented.`);
  }

  /* Behavioural */
  if (app.linkedin && !/linkedin\.com\/in\//i.test(app.linkedin)) {
    push("low", "LinkedIn link is not a profile URL", "Points somewhere other than a personal profile page.");
  }
  if (!app.linkedin && app.role === "professional") {
    push("low", "No LinkedIn profile", "Most working professionals have one. Its absence is weak on its own.");
  }
  if (app.submitSeconds !== undefined && app.submitSeconds < 45) {
    push("medium", "Application completed unusually fast",
      `Submitted in ${app.submitSeconds} seconds. Genuine applicants stop to find documents; prepared fakes paste from a script.`);
  }
  if (app.duplicateOf) {
    push("high", "Matches an existing account", `The same ID or email is already on file as ${app.duplicateOf}. Duplicate accounts are how a rejected applicant returns.`);
  }
  if (app.subjectMismatch) {
    push("medium", "Offers subjects outside their stated field",
      `Qualified in ${app.field}, offering ${app.subjectMismatch}. Ask what qualifies them for it.`);
  }

  const score = flags.reduce((a, f) => a + (f.level === "high" ? 3 : f.level === "medium" ? 1 : 0), 0);
  const verdict = score >= 6 ? "high" : score >= 3 ? "medium" : flags.length ? "low" : "clear";
  return { flags, score, verdict };
}
