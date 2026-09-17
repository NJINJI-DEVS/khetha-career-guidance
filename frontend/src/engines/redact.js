// Extracted from App.jsx (Stage 2 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { REDACTION_RULES } from '../data/redaction';

/* Safety guardrail: contact details are redacted before a message is
   ever stored or delivered. Runs on send, not on display, so the raw
   string never reaches the other learner's device. */

export function redact(text) {
  let out = text;
  const found = [];
  REDACTION_RULES.forEach((r) => {
    if (r.re.test(out)) {
      found.push(r.label);
      out = out.replace(r.re, "[removed]");
    }
    r.re.lastIndex = 0;
  });
  return { text: out, found: [...new Set(found)] };
}
