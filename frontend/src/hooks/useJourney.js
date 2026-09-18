// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useMemo } from 'react';
import { JOURNEY } from '../data/journey';

export function useJourney(profile) {
  return useMemo(() => {
    const steps = JOURNEY.map((s) => ({ ...s, complete: s.done(profile) }));
    const next = steps.find((s) => !s.complete) || null;
    const completed = steps.filter((s) => s.complete).length;
    return { steps, next, completed, total: steps.length };
  }, [profile]);
}
