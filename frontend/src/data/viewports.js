// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { RefreshCw, Smartphone, BookOpen, Building2 } from 'lucide-react';

export const VIEWPORTS = [
  { key: "auto", label: "Auto", icon: RefreshCw },
  { key: "mobile", label: "Mobile", icon: Smartphone },
  { key: "tablet", label: "Tablet", icon: BookOpen },
  { key: "desktop", label: "Desktop", icon: Building2 },
];
