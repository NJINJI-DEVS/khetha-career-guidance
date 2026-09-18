// Checklist A3 — retake history. Keeps the last eight attempts per instrument
// so a learner can compare a result against the previous one instead of the
// new run silently overwriting it.
export function pushHistory(history, key, entry) {
  const list = history?.[key] || [];
  return { ...(history || {}), [key]: [...list, { ...entry, at: Date.now() }].slice(-8) };
}

export const fmtWhen = (ts) =>
  new Date(ts).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
