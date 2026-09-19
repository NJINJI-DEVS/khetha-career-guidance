// South African public holidays, school terms and application deadlines.
//
// Public holidays are COMPUTED, not listed. The Public Holidays Act 36 of 1994
// fixes ten dates and defines two by Easter, and adds the rule that a holiday
// falling on a Sunday is observed on the Monday. All of that is expressible, so
// the calendar is correct for any year instead of correct until someone
// remembers to add next year's table.
//
// School terms and application deadlines CANNOT be computed — they are
// published each year by the DBE in the Government Gazette, and by each
// institution. Those carry `provisional: true` until checked against the
// gazette for the year in question, and the UI says so rather than presenting
// them as settled. A learner who misses an application because this app showed
// a plausible-looking wrong date is worse off than one who was told to check.

export const CATEGORIES = {
  holiday: { key: 'holiday', label: 'Public holidays', tone: 'red' },
  term: { key: 'term', label: 'School terms', tone: 'green' },
  deadline: { key: 'deadline', label: 'Application deadlines', tone: 'gold' },
  exam: { key: 'exam', label: 'Exams', tone: 'blue' },
  // Sessions this learner has accepted. Its own category so it can be filtered
  // separately, and so "what am I committed to" is answerable at a glance.
  mine: { key: 'mine', label: 'My sessions', tone: 'green' },
};

const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/**
 * Easter Sunday by the Anonymous Gregorian algorithm (Meeus/Jones/Butcher).
 * Good Friday and Family Day are the only two movable South African holidays
 * and both hang off this.
 */
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

const FIXED = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 3, day: 21, name: 'Human Rights Day' },
  { month: 4, day: 27, name: 'Freedom Day' },
  { month: 5, day: 1, name: "Workers' Day" },
  { month: 6, day: 16, name: 'Youth Day' },
  { month: 8, day: 9, name: "National Women's Day" },
  { month: 9, day: 24, name: 'Heritage Day' },
  { month: 12, day: 16, name: 'Day of Reconciliation' },
  { month: 12, day: 25, name: 'Christmas Day' },
  { month: 12, day: 26, name: 'Day of Goodwill' },
];

/** Every public holiday in `year`, including Monday observances. */
export function publicHolidays(year) {
  const out = [];

  for (const h of FIXED) {
    const date = new Date(Date.UTC(year, h.month - 1, h.day));
    out.push({
      id: `ph-${year}-${h.month}-${h.day}`,
      date: iso(year, h.month, h.day),
      title: h.name,
      category: 'holiday',
      note: 'Public holiday — schools and most offices closed.',
    });
    // Public Holidays Act s2(1): a Sunday holiday is observed on the Monday.
    // Note the Act says nothing about Saturdays, so no Friday is added.
    if (date.getUTCDay() === 0) {
      const mon = new Date(date.getTime() + 86400000);
      out.push({
        id: `ph-${year}-${h.month}-${h.day}-obs`,
        date: iso(mon.getUTCFullYear(), mon.getUTCMonth() + 1, mon.getUTCDate()),
        title: `${h.name} (observed)`,
        category: 'holiday',
        note: `${h.name} falls on a Sunday, so the Monday is the public holiday.`,
      });
    }
  }

  const easter = easterSunday(year);
  const good = new Date(easter.getTime() - 2 * 86400000);
  const family = new Date(easter.getTime() + 86400000);
  out.push({
    id: `ph-${year}-goodfriday`,
    date: iso(good.getUTCFullYear(), good.getUTCMonth() + 1, good.getUTCDate()),
    title: 'Good Friday',
    category: 'holiday',
    note: 'Public holiday.',
  });
  out.push({
    id: `ph-${year}-familyday`,
    date: iso(family.getUTCFullYear(), family.getUTCMonth() + 1, family.getUTCDate()),
    title: 'Family Day',
    category: 'holiday',
    note: 'Public holiday, the Monday after Easter.',
  });

  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * DBE school terms. Published annually in the Government Gazette; inland and
 * coastal provinces differ by a week at the start and end of some terms, which
 * is why each entry names which it applies to.
 *
 * MARKED PROVISIONAL ON PURPOSE. These are the shape of the year, not a
 * gazetted source of truth, and the UI must keep saying so until someone has
 * checked them against the published calendar for that year.
 */
export const SCHOOL_TERMS = {
  2026: [
    { id: 't1-26', title: 'Term 1 begins', date: '2026-01-14', category: 'term', region: 'Inland', provisional: true },
    { id: 't1-26c', title: 'Term 1 begins (coastal)', date: '2026-01-21', category: 'term', region: 'Coastal', provisional: true },
    { id: 't1e-26', title: 'Term 1 ends', date: '2026-03-27', category: 'term', provisional: true },
    { id: 't2-26', title: 'Term 2 begins', date: '2026-04-07', category: 'term', provisional: true },
    { id: 't2e-26', title: 'Term 2 ends', date: '2026-06-26', category: 'term', provisional: true },
    { id: 't3-26', title: 'Term 3 begins', date: '2026-07-21', category: 'term', provisional: true },
    { id: 't3e-26', title: 'Term 3 ends', date: '2026-10-02', category: 'term', provisional: true },
    { id: 't4-26', title: 'Term 4 begins', date: '2026-10-12', category: 'term', provisional: true },
    { id: 't4e-26', title: 'Term 4 ends', date: '2026-12-09', category: 'term', provisional: true },
    { id: 'nsc-26', title: 'NSC final exams begin', date: '2026-10-19', category: 'exam', provisional: true,
      note: 'Grade 12 final examinations. Check the exact timetable with your school.' },
  ],
};

/**
 * Post-school application windows. Institution-set and they move, so these are
 * the ones that are stable year to year and matter most; each carries the
 * official page to check. Provisional for the same reason as terms.
 */
export const APPLICATION_WINDOWS = [
  {
    id: 'nsfas', title: 'NSFAS applications close', date: '2026-01-31', category: 'deadline', provisional: true,
    note: 'Funding for university and TVET study. Applying late is the single most common reason a funded place is lost.',
    link: 'https://www.nsfas.org.za/',
  },
  {
    id: 'tvet-s1', title: 'TVET semester 1 registration', date: '2026-01-12', category: 'deadline', provisional: true,
    note: 'Most public TVET colleges open registration in January for the first semester.',
    link: 'https://www.dhet.gov.za/',
  },
  {
    id: 'uni-open', title: 'University applications open (2027 intake)', date: '2026-04-01', category: 'deadline', provisional: true,
    note: 'Most universities open applications for the following year around April.',
  },
  {
    id: 'uni-close', title: 'Most university applications close', date: '2026-09-30', category: 'deadline', provisional: true,
    note: 'Many institutions close on 30 September. Some close earlier for high-demand programmes such as medicine.',
  },
  {
    id: 'tvet-s2', title: 'TVET semester 2 registration', date: '2026-06-15', category: 'deadline', provisional: true,
    note: 'Second-semester intake — a genuine second chance if January was missed.',
  },
  {
    id: 'nbt', title: 'NBT test registration closes', date: '2026-08-31', category: 'deadline', provisional: true,
    note: 'National Benchmark Tests, required by several universities for certain programmes.',
    link: 'https://www.nbt.ac.za/',
  },
];

/** Everything for one year, sorted by date. */
export function calendarEvents(year) {
  return [
    ...publicHolidays(year),
    ...(SCHOOL_TERMS[year] || []),
    ...APPLICATION_WINDOWS.filter((e) => e.date.startsWith(String(year))),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

/** True when any shown item is not yet checked against an official source. */
export function hasProvisional(events) {
  return events.some((e) => e.provisional);
}
