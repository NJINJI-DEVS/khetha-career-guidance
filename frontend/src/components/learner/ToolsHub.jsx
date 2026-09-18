// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { BookOpen, Compass, Target, Calculator, Check, ChevronRight, ClipboardCheck, FileText } from 'lucide-react';
import { KHETHA } from '../../theme/tokens';
import { SectionTitle } from '../ui/SectionTitle';
import { Pill } from '../ui/Pill';

export function ToolsHub({ t, go, profile }) {
  const tools = [
    { key: "chooser", icon: BookOpen, color: KHETHA.green, title: t("subjectChooser"),
      body: "Grade 9 marks and interests to a Grade 10 package.", done: !!profile.subjectResult },
    { key: "choice", icon: Compass, color: KHETHA.blue, title: t("careerChoice"),
      body: "Twelve questions on what you enjoy, scored on six interest types.", done: !!profile.careerChoice },
    { key: "fit", icon: Target, color: KHETHA.gold, title: t("jobFit"),
      body: "How and where you want to work, matched to real occupations.", done: !!profile.jobFit },
    { key: "aps", icon: Calculator, color: KHETHA.red, title: t("apsCalc"),
      body: "Calculate your NSC score and simulate better marks.", done: false },
    { key: "evaluate", icon: ClipboardCheck, color: "#1E6F8C", title: "Subject evaluation",
      body: "FET phase: what each of your subjects opens, what it blocks, and which mark to lift first.", done: false },
    { key: "cv", icon: FileText, color: "#5B4B8A", title: "CV builder",
      body: "Six steps to a CV employers can actually read, with a shareable link.", done: !!profile.cvStarted },
  ];
  return (
    <div className="space-y-3 p-4 pb-6">
      <SectionTitle hint="All work offline">Career tools</SectionTitle>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button key={tool.key} onClick={() => go(`tool:${tool.key}`)}
            className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ background: tool.color, color: tool.key === "fit" ? KHETHA.ink : "#fff" }}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{tool.title}</span>
                {tool.done && <Pill tone="green" icon={Check}>Done</Pill>}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-600">{tool.body}</span>
            </span>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
          </button>
        );
      })}
    </div>
  );
}
