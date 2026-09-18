// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { BookOpen, Compass, Target, Calculator, Check, ClipboardCheck } from 'lucide-react';
import { THEME } from '../../theme/tokens';
import { SectionTitle } from '../ui/SectionTitle';

/* Quick access to the tools, straight from the dashboard */
export function ToolsStrip({ t, go, profile }) {
  const tools = [
    { key: "tool:chooser", icon: BookOpen, color: THEME.primary, label: t("subjectChooser"), done: !!profile.subjectResult },
    { key: "tool:choice", icon: Compass, color: THEME.blue, label: t("careerChoice"), done: !!profile.careerChoice },
    { key: "tool:fit", icon: Target, color: THEME.gold, label: t("jobFit"), done: !!profile.jobFit },
    { key: "tab:aps", icon: Calculator, color: THEME.red, label: t("apsCalc"), done: !!profile.apsVisited },
    { key: "tool:evaluate", icon: ClipboardCheck, color: "#1E6F8C", label: "Subject evaluation", done: false },
  ];
  return (
    <div>
      <SectionTitle hint={t("tapToOpen")}>{t("careerTools")}</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => go(t.key)}
              className="relative rounded-2xl border border-slate-200 bg-white p-3 text-left">
              <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: t.color }}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-2 text-xs font-semibold leading-tight text-slate-900">{t.label}</p>
              {t.done && (
                <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full k-bg-E7F4EE">
                  <Check className="h-3 w-3 k-tx-005A36" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
