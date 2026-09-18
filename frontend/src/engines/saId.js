// Extracted from App.jsx (Stage 2 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

/* ---- South African ID number validation --------------------------- */
export function checkSaId(raw) {
  const id = (raw || "").replace(/\s/g, "");
  if (!/^\d{13}$/.test(id)) return { valid: false, reason: "not 13 digits" };

  const yy = +id.slice(0, 2), mm = +id.slice(2, 4), dd = +id.slice(4, 6);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return { valid: false, reason: "impossible date of birth" };

  /* Luhn checksum, as used by Home Affairs */
  let sum = 0, alt = false;
  for (let i = id.length - 1; i >= 0; i--) {
    let n = +id[i];
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  if (sum % 10 !== 0) return { valid: false, reason: "checksum fails" };

  const citizen = +id[10];
  if (citizen > 1) return { valid: false, reason: "invalid citizenship digit" };

  const nowYY = new Date().getFullYear() % 100;
  const century = yy <= nowYY ? 2000 : 1900;
  const age = new Date().getFullYear() - (century + yy);

  return { valid: true, age, citizen: citizen === 0 ? "SA citizen" : "permanent resident" };
}
