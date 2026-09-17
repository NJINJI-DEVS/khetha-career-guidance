// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { Languages } from 'lucide-react';
import { LANGUAGES } from '../../data/i18n';

export function LanguagePicker({ t, lang, setLang, compact }) {
  return (
    <div className={compact ? "" : "rounded-2xl border border-slate-200 bg-white p-3"}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-900">
        <Languages className="h-3.5 w-3.5" />{t("chooseLanguage")}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {LANGUAGES.map((l) => (
          <button key={l.code} onClick={() => setLang(l.code)}
            lang={l.code} aria-pressed={lang === l.code}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              lang === l.code ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
            }`}>
            {l.native}
          </button>
        ))}
      </div>
      {!compact && (
        <p className="mt-2 text-[10px] leading-relaxed text-slate-600">{t("languageHint")}</p>
      )}
    </div>
  );
}
