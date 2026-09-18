// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { Bell, CalendarDays, CircleHelp, ChevronRight } from 'lucide-react';
import { CHANNELS, EVENTS, FAQS } from '../../data/outreach';
import { SectionTitle } from '../ui/SectionTitle';
import { Pill } from '../ui/Pill';

/* ---------- R8: advice directory, events, contact channels --------- */
export function AdviceDirectory({ notify }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle hint="Free to call">Reach a career practitioner</SectionTitle>
        <div className="space-y-2.5">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            const inner = (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-E7F4EE k-tx-005A36">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{c.label}</span>
                  <span className="block text-sm font-semibold k-tx-005A36">{c.detail}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">{c.note}</span>
                </span>
              </>
            );
            return c.action ? (
              <a key={c.id} href={c.action} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">{inner}</a>
            ) : (
              <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">{inner}</div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle hint="Tap the bell to be reminded">Events near you</SectionTitle>
        <div className="space-y-2.5">
          {EVENTS.map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-FBF5E7 k-tx-6B5307">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-600">{e.date} · {e.venue}</p>
                <div className="mt-2 flex gap-1.5">
                  <Pill tone="slate">{e.type}</Pill>
                  <Pill tone="slate">{e.province}</Pill>
                </div>
              </div>
              <button onClick={() => notify(e)} aria-label={`Remind me about ${e.title}`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Common questions</SectionTitle>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {FAQS.map((f, i) => (
            <div key={i}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="flex w-full items-center gap-2 p-3 text-left">
                <CircleHelp className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="flex-1 text-sm font-medium text-slate-900">{f.q}</span>
                <ChevronRight className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && (
                <p className="px-3 pb-3 text-xs leading-relaxed text-slate-600">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
