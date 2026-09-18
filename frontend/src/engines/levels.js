// Extracted from App.jsx (Stage 2 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { NSC_BANDS } from '../data/subjects';

/* ---------- NSC scoring (R2, APS tool) ---------------------------- */
export const toLevel = (p) => NSC_BANDS.find((b) => p >= b.min).level;
export const bandLabel = (p) => NSC_BANDS.find((b) => p >= b.min).label;
