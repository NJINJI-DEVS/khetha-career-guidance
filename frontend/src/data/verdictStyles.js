// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { THEME } from '../theme/tokens';
import { AlertTriangle, Info, CircleHelp } from 'lucide-react';

export const VERDICT_STYLE = {
  clear: { tone: "green", label: "Nothing flagged", color: THEME.primary },
  low: { tone: "slate", label: "Minor points to check", color: "#64748B" },
  medium: { tone: "gold", label: "Needs a closer look", color: THEME.gold },
  high: { tone: "red", label: "Serious concerns", color: THEME.red },
};

export const LEVEL_STYLE = {
  high: { tone: "red", icon: AlertTriangle, label: "High" },
  medium: { tone: "gold", icon: Info, label: "Medium" },
  low: { tone: "slate", icon: CircleHelp, label: "Low" },
};
