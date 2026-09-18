// CV builder.
//
// Orchestration only — the six forms live in CvSteps, the document in
// CvTemplates, and the scoring in engines/cvScore.
//
// Two decisions worth knowing about:
//
// EXPORT IS window.print(). Not html2canvas or html2pdf. Those rasterise the
// page, and an image of a CV has no selectable text, so an applicant tracking
// system extracts nothing from it — which defeats the whole point of an
// ATS-safe template. Printing keeps real vector text, adds nothing to the
// bundle, and works offline. The print stylesheet lives in index.css.
//
// AUTOSAVE IS DEBOUNCED AND OPTIMISTIC. A learner on a bad connection must
// never lose a step's typing to a failed request, so state is local and the
// save is best-effort behind it.

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Printer, Share2, Eye, PencilLine, Check,
  Loader2, Link2, Copy, AlertTriangle, FileText,
} from 'lucide-react';
import { CV_STEPS } from './CvSteps';
import { CvRender, TEMPLATES } from './CvTemplates';
import { scoreCv, EMPTY_CV } from '../../engines/cvScore';
import { getMyCv, saveMyCv, shareMyCv, unshareMyCv, getSharedCv } from '../../lib/api';
import { Screen } from '../ui/Screen';
import { Progress } from '../ui/Progress';
import { Pill } from '../ui/Pill';

const AUTOSAVE_MS = 1200;

export function CvWizard({ onBack, learner, subjects, favourites, readOnly = false }) {
  const [cv, setCv] = useState(EMPTY_CV);
  const [template, setTemplate] = useState("classic");
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("edit");        // edit | preview  (mobile switches; desktop shows both)
  const [status, setStatus] = useState("loading"); // loading | idle | saving | saved | error
  const [shareToken, setShareToken] = useState(null);
  const [copied, setCopied] = useState(false);

  const loaded = useRef(false);
  const score = useMemo(() => scoreCv(cv), [cv]);

  /* ---- load once ---- */
  useEffect(() => {
    let cancelled = false;
    getMyCv()
      .then((d) => {
        if (cancelled) return;
        try { setCv({ ...EMPTY_CV, ...JSON.parse(d.payload || "{}") }); } catch { setCv(EMPTY_CV); }
        setTemplate(d.template || "classic");
        setShareToken(d.shareToken || null);
        setStatus("idle");
        loaded.current = true;
      })
      .catch(() => { setStatus("error"); loaded.current = true; });
    return () => { cancelled = true; };
  }, []);

  /* ---- debounced autosave ---- */
  useEffect(() => {
    if (!loaded.current || readOnly || status === "loading") return undefined;
    const timer = setTimeout(() => {
      setStatus("saving");
      saveMyCv({ payload: JSON.stringify(cv), template, completeness: score.total })
        .then(() => setStatus("saved"))
        .catch(() => setStatus("error"));
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [cv, template, score.total]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = useCallback((partial) => setCv((c) => ({ ...c, ...partial })), []);

  const share = async () => {
    try {
      const d = await shareMyCv();
      setShareToken(d.shareToken);
    } catch { setStatus("error"); }
  };

  const revoke = async () => {
    try { await unshareMyCv(); setShareToken(null); } catch { setStatus("error"); }
  };

  const shareUrl = shareToken ? `${window.location.origin}/?cv=${shareToken}` : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — the link is on screen anyway */ }
  };

  const Current = CV_STEPS[step].Component;
  const isLast = step === CV_STEPS.length - 1;

  if (status === "loading") {
    return (
      <Screen onBack={onBack} title="CV builder">
        <p className="flex items-center gap-2 p-4 text-xs text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />Opening your CV…
        </p>
      </Screen>
    );
  }

  return (
    <Screen onBack={onBack} title="CV builder" subtitle={CV_STEPS[step].title}
      action={
        <button onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200 lg:hidden">
          {mode === "edit" ? <><Eye className="h-3.5 w-3.5" />Preview</> : <><PencilLine className="h-3.5 w-3.5" />Edit</>}
        </button>
      }>

      {/* Completeness — the single number that tells a learner where they stand */}
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs k-tx-BFE5D4">CV completeness</p>
            <p className="text-3xl font-bold tabular-nums">{score.total}%</p>
          </div>
          <Pill tone="gold">{score.band}</Pill>
        </div>
        <div className="mt-2.5"><Progress value={score.total} max={100} color="#D4AF37" /></div>
        {score.actions[0] && (
          <button onClick={() => { setStep(score.actions[0].step); setMode("edit"); }}
            className="mt-3 flex w-full items-start gap-2 rounded-xl bg-white/15 p-2.5 text-left">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-[11px] leading-relaxed">{score.actions[0].fix}</span>
            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          </button>
        )}
      </div>

      {/* Step rail */}
      <nav aria-label="CV sections" className="mt-4 flex gap-1.5 overflow-x-auto pb-1 k-scrollbar-none">
        {CV_STEPS.map((s, i) => {
          const done = score.sections.filter((x) => x.step === i).every((x) => x.complete);
          return (
            <button key={s.key} onClick={() => { setStep(i); setMode("edit"); }}
              aria-current={i === step ? "step" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                i === step ? "bg-slate-900 text-white" : done ? "k-bg-E7F4EE k-tx-005A36" : "bg-slate-100 text-slate-700"
              }`}>
              {done && i !== step && <Check className="h-3 w-3" />}
              {i + 1}. {s.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 lg:grid lg:grid-cols-2 lg:gap-5">
        {/* Form */}
        <div className={mode === "preview" ? "hidden lg:block" : ""}>
          <Current cv={cv} patch={patch} learner={learner} subjects={subjects} favourites={favourites} />

          <div className="mt-5 flex items-center gap-2">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 k-dis-soft">
              <ChevronLeft className="h-4 w-4" />Back
            </button>
            {!isLast ? (
              <button onClick={() => setStep((s) => Math.min(CV_STEPS.length - 1, s + 1))}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
                Next<ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => setMode("preview")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white lg:hidden">
                <Eye className="h-4 w-4" />See my CV
              </button>
            )}
          </div>

          <p className="mt-2 text-center text-[10px] text-slate-600">
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
            {status === "error" && "Not saved — check your connection. Your typing is safe on this device."}
            {status === "idle" && "Changes save automatically"}
          </p>
        </div>

        {/* Preview */}
        <div className={mode === "edit" ? "hidden lg:block" : ""}>
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            {Object.values(TEMPLATES).map((t) => (
              <button key={t.key} onClick={() => setTemplate(t.key)} aria-pressed={template === t.key}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ring-1 ${
                  template === t.key ? "k-bg-005A36 text-white ring-transparent" : "bg-white text-slate-700 ring-slate-200"
                }`}>
                {t.label}
              </button>
            ))}
            <button onClick={() => window.print()}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white">
              <Printer className="h-3.5 w-3.5" />Download PDF
            </button>
          </div>

          <p className="mb-2.5 text-[10px] leading-relaxed text-slate-600">
            {TEMPLATES[template].blurb} Choose "Save as PDF" in the print dialog — that keeps the text readable by the
            screening software employers use.
          </p>

          {/* cv-print-root is what the print stylesheet keeps; everything else is hidden */}
          <div className="cv-print-root overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <CvRender cv={cv} template={template} />
          </div>

          {/* Share link */}
          <div className="cv-no-print mt-3 rounded-2xl border border-slate-200 bg-white p-3.5">
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <Share2 className="h-4 w-4" />Shareable link
            </p>
            {shareToken ? (
              <>
                <p className="mt-1.5 break-all rounded-lg bg-slate-50 p-2 text-[10px] text-slate-700">{shareUrl}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={copyLink}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <button onClick={revoke}
                    className="flex items-center justify-center gap-1.5 rounded-lg k-bg-FBEAE8 px-3 py-2 text-[11px] font-semibold k-tx-9B1C14">
                    Turn off
                  </button>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
                  Anyone with this link can read your CV without signing in. Turn it off when you no longer need it.
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                  Creates a web address you can send to an employer or bursary officer, so they can read your CV
                  without a file attachment.
                </p>
                <button onClick={share}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg k-bg-005A36 py-2.5 text-[11px] font-semibold text-white">
                  <Link2 className="h-3.5 w-3.5" />Create a link
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}

/**
 * Entry point for a ?cv=<token> link. Mounted from main.jsx ahead of the app
 * itself, because the recipient is an employer or bursary officer with no
 * account — routing them through the role picker and sign-in would be absurd.
 */
export function SharedCvRoute({ token }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    getSharedCv(token)
      .then((d) => !cancelled && setState({ status: "ready", ...d }))
      .catch(() => !cancelled && setState({ status: "missing" }));
    return () => { cancelled = true; };
  }, [token]);

  if (state.status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-200 p-8">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading CV…
        </p>
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-200 p-8">
        <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">This CV is no longer shared</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            The link has been turned off by the person who created it, or it was mistyped.
          </p>
        </div>
      </div>
    );
  }

  return <SharedCvView payload={state.payload} template={state.template} />;
}

/** The public view behind a share link — no wizard, no editing, just the CV. */
export function SharedCvView({ payload, template }) {
  let cv = EMPTY_CV;
  try { cv = { ...EMPTY_CV, ...JSON.parse(payload || "{}") }; } catch { /* keep empty */ }

  return (
    <div className="min-h-screen bg-slate-200 p-0 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="cv-no-print mb-3 flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-900">
            <FileText className="h-4 w-4" />Khetha CV
          </p>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white">
            <Printer className="h-3.5 w-3.5" />Print or save
          </button>
        </div>
        <div className="cv-print-root overflow-hidden rounded-2xl bg-white shadow-sm">
          <CvRender cv={cv} template={template} />
        </div>
      </div>
    </div>
  );
}
