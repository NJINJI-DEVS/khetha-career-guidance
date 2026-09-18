// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const OTP_LENGTH = 6;

export const DEMO_CODE = "204815";

export const CONSENT_ITEMS = [
  { key: "core", required: true, label: "Store my career profile",
    body: "Your questionnaire results, saved courses and marks are kept against your account so the app can guide you. Without this the app cannot personalise anything." },
  { key: "ncap", required: false, label: "Sync with my NCAP account",
    body: "Reads and writes your existing National Career Advice Portal record over the DHET API, so the website and the app never disagree." },
  { key: "notify", required: false, label: "Send me reminders",
    body: "Application deadlines, NSFAS dates and events near you. You can change this at any time in Settings." },
  { key: "research", required: false, label: "Use my data, anonymised, for research",
    body: "Helps DHET see which pathways learners struggle with. Your name and ID are removed before anything leaves the app." },
];
