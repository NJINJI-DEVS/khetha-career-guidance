// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { Phone, ShieldCheck, CalendarClock, CheckCircle2, AlertTriangle, BookOpen, Layers } from 'lucide-react';
import { KHETHA } from '../../theme/tokens';
import { OCCUPATIONS } from '../../data/occupations';
import { qualById } from '../../data/qualifications';
import { providerById, PROVIDER_TYPES } from '../../data/providers';
import { SUBJECT_LABELS } from '../../data/subjects';
import { SUBJECT_PURPOSE, subjectRoleFor, DEPTH_LABEL } from '../../data/subjectRoles';
import { eligibility } from '../../engines/subjects';
import { Screen } from '../ui/Screen';
import { FavouriteButton } from '../ui/FavouriteButton';
import { Pill } from '../ui/Pill';
import { SectionTitle } from '../ui/SectionTitle';

export function QualDetail({ id, onBack, ctx, fav, toggleFav }) {
  const q = qualById[id];
  const p = providerById[q.providerId];
  const { eligible, unmet } = eligibility(q, ctx);
  const leadsTo = OCCUPATIONS.filter((o) => o.quals.includes(q.id));
  return (
    <Screen onBack={onBack} title={q.title} subtitle={p.name}
      action={<FavouriteButton on={fav.includes(q.id)} onToggle={() => toggleFav(q.id)} label={q.title} />}>
      <div className={`rounded-2xl p-4 text-white`} style={{ background: eligible ? KHETHA.greenDeep : "#0F172A" }}>
        <p className="text-xs opacity-80">{eligible ? "You qualify" : "Not yet"}</p>
        <p className="mt-1 text-sm leading-relaxed">
          {eligible
            ? `Your marks meet every requirement. Applications close ${q.deadline}.`
            : `Still needed: ${unmet.join(" · ")}`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[{ l: "Minimum APS", v: q.minAPS }, { l: "NQF level", v: q.nqf }, { l: "Duration", v: q.duration }].map((s) => (
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
            <p className="text-sm font-bold text-slate-900">{s.v}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{s.l}</p>
          </div>
        ))}
      </div>

      {/* FET phase: not just which subjects are required, but what each one is
          for and where it is used inside this specific qualification. */}
      <SectionTitle hint="Why each one, and where you use it">Subject requirements</SectionTitle>

      {q.pureMathsOnly && (
        <div className="mb-2.5 rounded-2xl border k-bd-E5A79F k-bg-FBEAE8 p-3.5">
          <p className="flex items-center gap-2 text-sm font-semibold k-tx-9B1C14">
            <AlertTriangle className="h-4 w-4" />Pure Mathematics only
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">
            Mathematical Literacy is not accepted for this qualification at any mark. This is a hard wall set by the
            institution, not a high bar you can argue past with a strong application.
          </p>
        </div>
      )}

      {Object.keys(q.requires).length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">No specific subject requirements</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
            Entry rests on your overall NSC result rather than named subjects — which makes this a genuine second
            chance if a single subject went badly. You still need the NSC itself.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {Object.entries(q.requires).map(([key, min]) => {
            const got = ctx.marks[key];
            const met = got !== undefined && got >= min;
            const purpose = SUBJECT_PURPOSE[key];
            const role = subjectRoleFor(q.id, key);
            return (
              <div key={key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className={`flex items-start gap-2.5 p-3.5 ${met ? "k-bg-E7F4EE" : "k-bg-FBF5E7"}`}>
                  {met
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 k-tx-005A36" />
                    : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 k-tx-6B5307" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {purpose?.label || SUBJECT_LABELS[key] || key}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700">
                      {got === undefined
                        ? `This course wants ${min}%. No mark on file yet.`
                        : met
                          ? `You have ${got}%, clearing the ${min}% required.`
                          : `You have ${got}% and need ${min}% — ${min - got} point${min - got === 1 ? "" : "s"} short.`}
                    </p>
                  </div>
                  {role?.depth && <Pill tone="slate">{DEPTH_LABEL[role.depth]}</Pill>}
                </div>

                <div className="space-y-2.5 p-3.5">
                  {role ? (
                    <>
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                          <BookOpen className="h-3.5 w-3.5" />Where you use it in this course
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{role.where}</p>
                      </div>
                      {role.modules?.length > 0 && (
                        <div>
                          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                            <Layers className="h-3.5 w-3.5" />Modules it feeds
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {role.modules.map((m) => <Pill key={m} tone="blue">{m}</Pill>)}
                          </div>
                        </div>
                      )}
                    </>
                  ) : purpose && (
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      <span className="font-semibold text-slate-800">What it builds: </span>{purpose.builds}
                    </p>
                  )}

                  {purpose?.closes && (
                    <p className="border-t border-slate-100 pt-2.5 text-[11px] leading-relaxed k-tx-9B1C14">
                      <span className="font-semibold">Without this subject: </span>{purpose.closes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Funding and dates</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {q.nsfas ? <Pill tone="green" icon={ShieldCheck}>NSFAS accredited</Pill> : <Pill tone="red">Self-funded</Pill>}
          <Pill tone="navy" icon={CalendarClock}>Closes {q.deadline}</Pill>
        </div>
      </div>

      {leadsTo.length > 0 && (
        <>
          <SectionTitle>Careers this leads to</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {leadsTo.map((o) => <Pill key={o.id} tone="blue">{o.title}</Pill>)}
          </div>
        </>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">{p.name}</p>
        <p className="mt-0.5 text-[11px] text-slate-600">{p.city}, {p.province} · {PROVIDER_TYPES[p.type]}</p>
        <a href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900">
          <Phone className="h-3.5 w-3.5" />{p.phone}
        </a>
      </div>
    </Screen>
  );
}
