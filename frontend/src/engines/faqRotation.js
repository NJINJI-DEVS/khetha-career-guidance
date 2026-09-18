// Rotates the "common questions" so a learner who opens the advice tab every
// week does not see the same four entries forever. Two things drive the pick:
// the learner's grade (the app already knows it, so asking a Grade 12 about
// subject choice is noise) and the calendar day, which moves the window on.
//
// Deliberately deterministic per day rather than random: a learner who reopens
// the app an hour later should see the same list they were half way through
// reading, not a reshuffle.

const DAY_MS = 86400000;

export const dayIndex = (now = Date.now()) => Math.floor(now / DAY_MS);

export function rotateFaqs(pool, { grade = null, count = 4, now = Date.now() } = {}) {
  const relevant = grade
    ? pool.filter((f) => !f.grades || f.grades.includes(grade))
    : pool;
  // Falling back to the whole pool keeps the section from collapsing to one
  // entry for a grade with few tagged questions.
  const list = relevant.length >= count ? relevant : pool;
  if (!list.length) return [];

  const start = dayIndex(now) % list.length;
  return Array.from({ length: Math.min(count, list.length) }, (_, i) => list[(start + i) % list.length]);
}

export function msUntilNextRotation(now = Date.now()) {
  return (dayIndex(now) + 1) * DAY_MS - now;
}
