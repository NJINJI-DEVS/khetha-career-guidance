// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const REDACTION_RULES = [
  { re: /(\+?27|0)\s?(\d[\s-]?){8,11}\d/g, label: "phone number" },
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/g, label: "email address" },
  { re: /\b(?:https?:\/\/|www\.)\S+/gi, label: "link" },
  { re: /@[A-Za-z0-9._]{3,}/g, label: "social handle" },
  { re: /\b(whatsapp|instagram|tiktok|snapchat|telegram)\b/gi, label: "social platform" },
];
