// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { ChevronRight, ShieldCheck, Eye } from 'lucide-react';
import { ROLES } from '../../data/roles';

// Administrator is not something anyone joins as — the rights are granted by
// another administrator against a staff account, and the old card led to a
// sign-in that could never succeed. It lives behind the discreet shield below
// instead, where staff know to look and learners are not invited to try.
const JOINABLE_ROLES = Object.values(ROLES).filter((r) => r.key !== 'admin');
import { Pill } from '../ui/Pill';
import { DhetArms, KhethaWordmark } from '../ui/BrandMarks';
import { LanguageDropdown } from '../ui/LanguageDropdown';

export function RoleSelector({ t, lang, setLang, onPick, onGuest, onAdmin }) {
  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-4">
      {/* Utility row: language and staff sign-in, in their own line so the
          departmental identity below keeps its fixed proportions. Putting these
          beside the coat of arms made the row wrap on a narrow phone and pushed
          the national colour rule out of place. */}
      <div className="flex items-center justify-end gap-2">
        <LanguageDropdown t={t} lang={lang} setLang={setLang} />
        {onAdmin && (
          <button onClick={onAdmin} title="Administrator sign-in"
            aria-label="Administrator sign-in"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-900 hover:text-white">
            <ShieldCheck className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <DhetArms className="h-14 shrink-0" />
        <div className="leading-none">
          <p className="text-[15px] font-semibold lowercase leading-tight tracking-tight text-slate-900">
            higher education<br />&amp; training
          </p>
          <p className="mt-1.5 border-t border-slate-300 pt-1.5 text-[9px] leading-tight text-slate-600">
            Department of Higher Education and Training<br />
            <span className="font-semibold text-slate-800">REPUBLIC OF SOUTH AFRICA</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex h-1 w-24 overflow-hidden rounded-full">
        <span className="flex-1 k-bg-005A36" /><span className="flex-1 k-bg-D4AF37" />
        <span className="flex-1 k-bg-1E3A6E" /><span className="flex-1 k-bg-B3261E" />
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{t("howJoining")}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        This decides what the app shows you. Mentors and professionals go through verification before any learner
        can reach them.
      </p>

      <div className="mt-6 grid gap-2.5">
        {JOINABLE_ROLES.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.key} onClick={() => onPick(r.key)}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-400">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
                style={{ background: r.color }}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{t(r.labelKey)}</span>
                  {r.verifies && <Pill tone="gold">{t("verificationRequired")}</Pill>}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">{t(r.blurbKey)}</span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
            </button>
          );
        })}
      </div>

      {onGuest && (
        <button onClick={onGuest}
          className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-left transition-colors hover:border-slate-400">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
            <Eye className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-slate-900">Just looking around</span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">
              Explore the whole app with no account. Nothing is stored, and you can sign up later.
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        </button>
      )}

      <div className="mt-auto pt-8">
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={() => onPick('admin')} aria-label="Administrator login" title="Administrator login"
            className="rounded-lg p-3 text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-500">
            <ShieldCheck className="h-5 w-5" />
          </button>
        </div>
        <p className="flex items-start gap-2 rounded-xl k-bg-E7F4EE p-3 text-[11px] leading-relaxed k-tx-005A36">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          {t("vettedNote")}
        </p>
        <div className="mt-5 flex justify-center"><KhethaWordmark className="h-8" /></div>
      </div>
    </div>
  );
}
