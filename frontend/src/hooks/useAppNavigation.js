// Extracted from App.jsx's root component (KhethaCareerGuidance): owns the
// tab/route/exploreTab/fieldFilter navigation state, the go() string
// dispatcher, and the role-based nav menu construction (NAV_BY_ROLE/SECONDARY).
// `onSms` lets go("sms") reach the root's smsOpen modal state without this
// hook owning modal state itself.
import { useState } from 'react';
import {
  Home, Calculator, Compass, Users, MessageCircle, User, Wrench, WifiOff,
  ClipboardList, TrendingUp, CalendarDays, Ticket,
} from 'lucide-react';

export function useAppNavigation({ role, t, onSms }) {
  const [tab, setTab] = useState("dashboard");
  const [route, setRoute] = useState(null);
  const [exploreTab, setExploreTab] = useState("careers");
  const [fieldFilter, setFieldFilter] = useState("all");

  const go = (target) => {
    if (target === "sms") { onSms?.(); return; }
    if (target === "offline") { setRoute(null); setTab("offline"); return; }
    if (target.startsWith("tab:")) { setRoute(null); setTab(target.slice(4)); return; }
    if (target.startsWith("explore:")) {
      setRoute(null); setTab("courses"); setExploreTab(target.slice(8)); return;
    }
    if (target.startsWith("field:")) {
      setRoute(null); setTab("courses"); setExploreTab("careers"); setFieldFilter(target.slice(6)); return;
    }
    if (target === "advice") { setRoute(null); setTab("courses"); setExploreTab("advice"); return; }
    setRoute(target);
  };

  /* Primary navigation, rendered per role */
  const NAV_BY_ROLE = {
    // "Home" rather than "Dashboard": this screen is a landing feed — news,
    // quick links, next step — not an analytics dashboard. The analytics that
    // the old name implied now live in their own Progress tab.
    //
    // APS gave up its primary slot to make room. It is one tap away in Tools
    // and linked from Home, whereas Progress had no route at all; on mobile
    // there are exactly five slots and SECONDARY never renders.
    student: [
      { key: "dashboard", label: t("home"), icon: Home },
      { key: "courses", label: t("courses"), icon: Compass },
      { key: "progress", label: t("progress"), short: t("progress"), icon: TrendingUp },
      { key: "mentors", label: t("mentorHub"), short: t("shortMentor"), icon: Users },
      { key: "advisor", label: t("aiAdvisor"), short: t("aiAdvisor"), icon: MessageCircle },
    ],
    mentor: [
      { key: "workspace", label: t("workspace"), icon: Home },
      { key: "courses", label: t("courses"), icon: Compass },
      { key: "advisor", label: t("aiAdvisor"), short: t("aiAdvisor"), icon: MessageCircle },
      { key: "me", label: t("myProfile"), short: t("myProfile"), icon: User },
    ],
    admin: [
      { key: "approvals", label: t("approvals"), icon: ClipboardList },
      { key: "analytics", label: t("analytics"), icon: TrendingUp },
      { key: "mentors", label: t("mentorNetwork"), short: t("shortMentor"), icon: Users },
      { key: "courses", label: t("courses"), icon: Compass },
      { key: "me", label: t("myProfile"), short: t("myProfile"), icon: User },
    ],
  };
  NAV_BY_ROLE.professional = NAV_BY_ROLE.mentor;

  const NAV = NAV_BY_ROLE[role] || NAV_BY_ROLE.student;
  const SECONDARY = role === "student"
    ? [{ key: "tools", label: t("careerTools"), icon: Wrench },
       { key: "invites", label: t("invites"), icon: Ticket },
       { key: "calendar", label: t("calendar"), icon: CalendarDays },
       { key: "aps", label: t("apsCalc"), icon: Calculator },
       { key: "offline", label: t("offlineSaving"), icon: WifiOff },
       { key: "me", label: t("myProfile"), icon: User }]
    : role === "admin"
      ? [{ key: "advisor", label: t("aiAdvisor"), icon: MessageCircle }]
      : [{ key: "mentors", label: t("mentorNetwork"), icon: Users }];
  const isStudent = role === "student";

  const exploreTabs = [
    { key: "careers", label: t("careers") },
    { key: "quals", label: t("whatToStudy") },
    { key: "providers", label: t("whereToStudy") },
    { key: "advice", label: t("advice") },
  ];

  return {
    tab, setTab, route, setRoute, exploreTab, setExploreTab, fieldFilter, setFieldFilter,
    go, NAV, SECONDARY, isStudent, exploreTabs,
  };
}
