// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const FREE_EMAIL = /@(gmail|yahoo|outlook|hotmail|live|icloud|webmail|aol)\./i;

export const LICENCE_FORMATS = {
  sace: { re: /^\d{8,10}$/, hint: "SACE numbers are 8 to 10 digits" },
  saica: { re: /^\d{6,8}$/, hint: "SAICA numbers are 6 to 8 digits" },
  ecsa: { re: /^\d{6,9}$/, hint: "ECSA numbers are 6 to 9 digits" },
  hpcsa: { re: /^[A-Z]{2}\s?\d{6,7}$/i, hint: "HPCSA numbers start with two letters" },
};
