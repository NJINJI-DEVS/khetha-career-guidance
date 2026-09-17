// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { THEME } from '../theme/tokens';
import { GraduationCap, Users, Briefcase, TrendingUp, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';

export const ROLES = {
  student: {
    key: "student", label: "Learner / Student", labelKey: "roleStudent", blurbKey: "roleStudentBody",
    icon: GraduationCap, color: THEME.primary, verifies: false,
  },
  mentor: {
    key: "mentor", label: "Peer Tutor / Institutional Mentor", labelKey: "roleMentor", blurbKey: "roleMentorBody",
    icon: Users, color: THEME.blue, verifies: true,
  },
  professional: {
    key: "professional", label: "Industry Professional", labelKey: "roleProfessional", blurbKey: "roleProfessionalBody",
    icon: Briefcase, color: THEME.gold, verifies: true,
  },
  admin: {
    key: "admin", label: "Platform Administrator", labelKey: "roleAdmin", blurbKey: "roleAdminBody",
    icon: TrendingUp, color: THEME.navy, verifies: false,
  },
};

export const PARTNER_CODES = {
  "IKAMVA-2027": "IkamvaYouth",
  "KUTL-2027": "Kutlwanong Centre for Maths, Science & Technology",
  "SRC-PEER-2027": "University SRC Peer Tutors",
  "TVET-SRC-2027": "TVET College SRC Tutor Corps",
};

export const LICENCE_BODIES = [
  { key: "sace", label: "SACE — South African Council for Educators", prefix: "SACE" },
  { key: "saica", label: "SAICA — Chartered Accountants", prefix: "SAICA" },
  { key: "ecsa", label: "ECSA — Engineering Council of SA", prefix: "ECSA" },
  { key: "hpcsa", label: "HPCSA — Health Professions Council", prefix: "HPCSA" },
  { key: "none", label: "Not applicable to my field", prefix: "" },
];

export const TIERS = {
  id: { key: "id", label: "ID Verified", tone: "blue", icon: ShieldCheck },
  degree: { key: "degree", label: "Degree Verified", tone: "green", icon: Award },
  ngo: { key: "ngo", label: "NGO Vetted", tone: "gold", icon: CheckCircle2 },
};
