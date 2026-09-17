// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { THEME } from '../theme/tokens';

export const TELEMETRY = {
  users: 48213,
  activeThisWeek: 12946,
  gradeSplit: { trackA: 17_361, trackB: 30_852 },
  provinces: [
    { name: "Gauteng", users: 14820 },
    { name: "KwaZulu-Natal", users: 8104 },
    { name: "Eastern Cape", users: 6233 },
    { name: "Limpopo", users: 5419 },
    { name: "Western Cape", users: 4877 },
    { name: "Mpumalanga", users: 3388 },
    { name: "North West", users: 2461 },
    { name: "Free State", users: 1802 },
    { name: "Northern Cape", users: 1109 },
  ],
  smsGenerated: 9_734,
  offlineToggles: 21_508,
  offlineShare: 0.44,
  avgAPS: 27.4,
  apsDistribution: [
    { band: "15–19", n: 4120 }, { band: "20–24", n: 8940 }, { band: "25–29", n: 10250 },
    { band: "30–34", n: 5380 }, { band: "35–42", n: 2162 },
  ],
  disconnectRate: 0.63,
  disconnectDetail: [
    { career: "Medicine (MBChB)", bookmarks: 6120, shortfall: 0.81 },
    { career: "Actuarial Science", bookmarks: 3480, shortfall: 0.78 },
    { career: "Chartered Accountant", bookmarks: 5240, shortfall: 0.59 },
    { career: "Software Developer", bookmarks: 7310, shortfall: 0.47 },
    { career: "Electrician", bookmarks: 4180, shortfall: 0.09 },
  ],
  gateway: { blockedByPureMaths: 0.58, mathsLitCeiling: 0.34, metBoth: 0.08 },
  topCareers: [
    { title: "Software Developer", views: 18_240, salary: 22000 },
    { title: "Electrician", views: 14_980, salary: 12000 },
    { title: "Professional Nurse", views: 13_410, salary: 18000 },
    { title: "Chartered Accountant", views: 11_860, salary: 35000 },
    { title: "Diesel Mechanic", views: 8_720, salary: 11000 },
    { title: "Data Analyst", views: 7_910, salary: 25000 },
  ],
  scarceSkillsAlignment: 0.71,
  mentorOps: { sent: 4_812, accepted: 3_106, declined: 964, pending: 742, lettersIssued: 1_287 },
  verificationMix: [
    { method: "Partner NGO code", n: 412, color: THEME.gold },
    { method: "Corporate / academic email", n: 268, color: THEME.blue },
    { method: "Academic transcript", n: 191, color: THEME.primary },
    { method: "ID document only", n: 96, color: "#64748B" },
  ],
};
