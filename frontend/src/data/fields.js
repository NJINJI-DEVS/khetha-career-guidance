// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { KHETHA } from '../theme/tokens';
import { FlaskConical, Heart, Briefcase, Wrench, Users, Star } from 'lucide-react';

export const FIELDS = [
  { key: "stem", label: "Engineering & Technology", color: KHETHA.blue, icon: FlaskConical },
  { key: "health", label: "Health Sciences", color: KHETHA.red, icon: Heart },
  { key: "business", label: "Business & Finance", color: KHETHA.gold, icon: Briefcase },
  { key: "trades", label: "Trades & Artisanship", color: KHETHA.green, icon: Wrench },
  { key: "social", label: "Education & Social Services", color: "#5B4B8A", icon: Users },
  { key: "creative", label: "Creative & Media", color: "#8C4A6B", icon: Star },
];

export const FIELD = Object.fromEntries(FIELDS.map((f) => [f.key, f]));
