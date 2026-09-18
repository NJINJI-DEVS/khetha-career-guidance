// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { THEME } from '../theme/tokens';
import { BookOpen, Compass, Target, Calculator, Heart, Users } from 'lucide-react';

export const JOURNEY = [
  { key: "chooser", n: 1, route: "tool:chooser", icon: BookOpen, color: THEME.primary,
    labelKey: "stepSubjects", bodyKey: "stepSubjectsBody", shortKey: "shortSubjects",
    done: (p) => !!p.subjectResult },
  { key: "choice", n: 2, route: "tool:choice", icon: Compass, color: THEME.blue,
    labelKey: "stepInterests", bodyKey: "stepInterestsBody", shortKey: "shortInterests",
    done: (p) => !!p.careerChoice },
  { key: "fit", n: 3, route: "tool:fit", icon: Target, color: THEME.gold,
    labelKey: "stepJobFit", bodyKey: "stepJobFitBody", shortKey: "shortJobFit",
    done: (p) => !!p.jobFit },
  { key: "aps", n: 4, route: "tab:aps", icon: Calculator, color: THEME.red,
    labelKey: "stepAps", bodyKey: "stepApsBody", shortKey: "shortAps",
    done: (p) => !!p.apsVisited },
  { key: "save", n: 5, route: "explore:quals", icon: Heart, color: THEME.navy,
    labelKey: "stepShortlist", bodyKey: "stepShortlistBody", shortKey: "shortShortlist",
    done: (p) => p.favourites.length > 0 },
  { key: "mentor", n: 6, route: "tab:mentors", icon: Users, color: THEME.primary,
    labelKey: "stepMentor", bodyKey: "stepMentorBody", shortKey: "shortMentor",
    done: (p) => !!p.requestSent },
];
