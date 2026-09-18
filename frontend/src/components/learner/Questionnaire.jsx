// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { KHETHA } from '../../theme/tokens';
import { RIASEC_TYPES, CAREER_CHOICE_Q, JOB_FIT_Q } from '../../data/assessments';
import { FIELD } from '../../data/fields';
import { scoreCareerChoice } from '../../engines/careerChoice';
import { scoreJobFit } from '../../engines/jobFit';
import { Screen } from '../ui/Screen';
import { SectionTitle } from '../ui/SectionTitle';
import { Progress } from '../ui/Progress';
import { Likert } from '../ui/Likert';
import { Pill } from '../ui/Pill';
import { SpeakButton } from '../ui/SpeakButton';
import { ResultHistory } from './ResultHistory';
import { useSettings } from '../../context/SettingsContext';

/* ==================================================================
   R3: Career Choice and Job Fit questionnaires
   ================================================================== */

export function Questionnaire({ kind, onBack, onSave, saved, history }) {
  const { settings } = useSettings();
  const { lang, readAloud } = settings;

  /* Checklist A3 names one question per screen, so perPage is 1 for both
     instruments — answering then auto-advances (see the Likert onChange). */
  const config = kind === "choice"
    ? { title: "Career Choice", questions: CAREER_CHOICE_Q, score: scoreCareerChoice,
        intro: "Twelve statements about what you enjoy. There are no right answers — answer for yourself, not for the job you think you should want.", perPage: 1 }
    : { title: "Job Fit", questions: JOB_FIT_Q, score: scoreJobFit,
        intro: "Ten statements about how and where you want to work. This matches you to the day-to-day reality of an occupation, not just the title.", perPage: 1 };

  const [answers, setAnswers] = useState(saved?.answers || {});
  const [page, setPage] = useState(saved ? -1 : 0);
  const pages = Math.ceil(config.questions.length / config.perPage);
  const slice = config.questions.slice(page * config.perPage, (page + 1) * config.perPage);
  const answered = Object.keys(answers).length;
  const pageDone = slice.every((q) => answers[q.id]);

  const finish = () => {
    const result = { answers, ...config.score(answers) };
    onSave(result);
    setPage(-1);
  };

  /* ---- results ---- */
  if (page === -1) {
    const result = saved && saved.answers === answers ? saved : { answers, ...config.score(answers) };
    return (
      <Screen onBack={onBack} title={`${config.title} results`}
        action={
          <button onClick={() => { setAnswers({}); setPage(0); }}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200">
            Retake
          </button>
        }>
        {kind === "choice" ? (
          <>
            <div className="rounded-2xl bg-slate-900 p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-slate-300">Your interest code</p>
                {readAloud && (
                  <SpeakButton lang={lang}
                    text={`Your interest code is ${result.code.join(", ")}. ${result.code.map((c) => RIASEC_TYPES[c].label).join(", ")}. Careers that match include ${result.matches.slice(0, 3).map((m) => m.title).join(", ")}.`} />
                )}
              </div>
              <p className="mt-1 text-3xl font-bold tracking-widest k-tx-D4AF37">{result.code.join("")}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                {result.code.map((c) => RIASEC_TYPES[c].label).join(" · ")}
              </p>
            </div>
            <div className="mt-4 space-y-2.5">
              {result.ranked.map((r) => (
                <div key={r.type} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{RIASEC_TYPES[r.type].label}</p>
                    <span className="text-xs font-semibold tabular-nums text-slate-700">{r.pct}%</span>
                  </div>
                  <div className="mt-2"><Progress value={r.pct} max={100} color={result.code.includes(r.type) ? KHETHA.green : "#CBD5E1"} /></div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{RIASEC_TYPES[r.type].blurb}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <p className="text-xs text-slate-300">Your work preferences</p>
            <div className="mt-3 space-y-2.5">
              {Object.entries(result.profile).map(([axis, v]) => (
                <div key={axis}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="capitalize text-slate-300">{axis === "things" ? "hands-on work" : axis}</span>
                    <span className="font-semibold tabular-nums">{v}/4</span>
                  </div>
                  <div className="mt-1"><Progress value={v} max={4} color={KHETHA.gold} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ResultHistory history={history} kind={kind}
          current={kind === "choice" ? result.code.join("") : `${result.matches[0].title} ${result.matches[0].fit}%`} />

        <SectionTitle hint="Tap to open">Careers that match</SectionTitle>
        <div className="space-y-2.5">
          {result.matches.slice(0, 6).map((o) => (
            <div key={o.id} className="rounded-xl border border-l-4 border-slate-200 bg-white p-3"
              style={{ borderLeftColor: FIELD[o.field].color }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{o.title}</p>
                <Pill tone="green">{kind === "fit" ? `${o.fit}% fit` : `${o.riasec.join("")}`}</Pill>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{o.summary}</p>
            </div>
          ))}
        </div>
      </Screen>
    );
  }

  /* ---- questions ---- */
  return (
    <Screen onBack={page === 0 ? onBack : () => setPage((p) => p - 1)} title={config.title}>
      <p className="-mt-2 mb-3 text-sm leading-relaxed text-slate-600">{config.intro}</p>
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[11px] text-slate-600">
          <span>
            {config.perPage === 1
              ? `Question ${page + 1} of ${config.questions.length}`
              : `Question ${page * config.perPage + 1}–${Math.min((page + 1) * config.perPage, config.questions.length)} of ${config.questions.length}`}
          </span>
          <span>{answered} answered</span>
        </div>
        <Progress value={answered} max={config.questions.length} color={KHETHA.blue} />
      </div>

      <div className="space-y-3">
        {slice.map((q) => (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <p className="flex-1 text-base leading-relaxed text-slate-900">{q.text}</p>
              {readAloud && <SpeakButton text={q.text} lang={lang} />}
            </div>
            <Likert name={q.text} value={answers[q.id]}
              onChange={(v) => {
                setAnswers((a) => ({ ...a, [q.id]: v }));
                /* One question per screen: answering is the action, so move on
                   rather than making the learner find a button. */
                if (config.perPage === 1) {
                  setTimeout(() => {
                    if (page + 1 < pages) setPage(page + 1);
                  }, 220);
                }
              }} />
          </div>
        ))}
      </div>

      <button
        onClick={() => (page + 1 < pages ? setPage(page + 1) : finish())}
        disabled={!pageDone}
        className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white transition-colors k-dis">
        {page + 1 < pages ? "Next" : "See my results"}
      </button>
      {!pageDone && (
        <p className="mt-2 text-center text-[11px] text-slate-600">
          {config.perPage === 1 ? "Pick an answer to continue." : "Answer every statement on this page to continue."}
        </p>
      )}
    </Screen>
  );
}
