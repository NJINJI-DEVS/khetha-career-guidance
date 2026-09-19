// Precise age from a date of birth, accounting for whether this year's
// birthday has actually happened yet — a plain "currentYear - birthYear"
// subtraction (which saId.js's ID-derived age used to do) is off by one for
// anyone who hasn't had their birthday yet this year.
export function calculateAge(dateOfBirth) {
  const dob = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}
