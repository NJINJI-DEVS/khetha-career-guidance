// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const THEME = {
  primary: "#005A36",     // Deep Forest Green
  primaryLight: "#00784A",
  primaryInk: "#00432A",
  gold: "#D4AF37",        // National Gold
  navy: "#0F172A",        // Slate Navy
  bg: "#F8FAFC",          // Soft Gray
  blue: "#1E3A6E",
  red: "#B3261E",
};

export const KHETHA = {          // alias kept so existing references resolve
  green: THEME.primaryLight, greenDeep: THEME.primary, greenInk: THEME.primaryInk,
  gold: THEME.gold, blue: THEME.blue, red: THEME.red, ink: THEME.navy,
};
