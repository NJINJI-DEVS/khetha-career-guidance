// R8: advice directory, events, contact channels.
//
// Every channel here now ends in something the learner can actually do —
// a dial, a deep link, a form — rather than a line of text describing a
// service. Events and walk-in centres use real distance when the learner
// opts into location, and province otherwise.

import { useState, useMemo } from 'react';
import {
  Bell, CalendarDays, CircleHelp, ChevronRight, ChevronDown, Navigation,
  Copy, Check, ExternalLink, RefreshCw, MapPin, Phone,
} from 'lucide-react';
import { CHANNELS, EVENTS, FAQS, KHETHA_CONTACT } from '../../data/outreach';
import { PROVIDERS } from '../../data/providers';
import { rotateFaqs } from '../../engines/faqRotation';
import { useNearby, fmtKm } from '../../hooks/useNearby';
import { SectionTitle } from '../ui/SectionTitle';
import { Pill } from '../ui/Pill';
import { CallbackModal } from './CallbackModal';

function LocationButton({ nearby, label }) {
  if (nearby.status === "granted") {
    return (
      <button onClick={nearby.clear} className="flex items-center gap-1.5 text-[11px] font-semibold k-tx-005A36">
        <Navigation className="h-3.5 w-3.5" />Sorted by distance · turn off
      </button>
    );
  }
  if (nearby.status === "unsupported") {
    return <p className="text-[11px] text-slate-600">This device cannot share a location.</p>;
  }
  return (
    <div>
      <button onClick={nearby.request} disabled={nearby.status === "asking"}
        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200 k-dis-soft">
        <Navigation className="h-3.5 w-3.5" />
        {nearby.status === "asking" ? "Finding you…" : label}
      </button>
      {nearby.status === "denied" && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
          Location is off, so this is ordered by province instead. Nothing else changes.
        </p>
      )}
    </div>
  );
}

export function AdviceDirectory({ notify, learner, go }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [openChannel, setOpenChannel] = useState(null);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const nearby = useNearby();

  /* Rotates daily and skips questions that do not apply to this learner's
     grade — the app already knows it, so showing all four forever is noise. */
  const faqs = useMemo(
    () => rotateFaqs(FAQS, { grade: learner?.grade ?? null }),
    [learner?.grade]
  );

  const events = useMemo(() => {
    const withDistance = EVENTS.map((e) => ({ ...e, km: nearby.distanceTo(e) }));
    if (!nearby.coords) return withDistance;
    return withDistance.sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9));
  }, [nearby.coords]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Khetha practitioners sit at TVET and community education centres. */
  const centres = useMemo(() => {
    const list = PROVIDERS.filter((p) => p.type === "tvet" || p.type === "cet")
      .map((p) => ({ ...p, km: nearby.distanceTo(p) }));
    if (!nearby.coords) return list;
    return list.sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9));
  }, [nearby.coords]); // eslint-disable-line react-hooks/exhaustive-deps

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — the number is on screen anyway */ }
  };

  const waHref = `https://wa.me/${KHETHA_CONTACT.whatsappE164}?text=${encodeURIComponent(KHETHA_CONTACT.whatsappKeyword)}`;

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle hint="Free to call">Reach a career practitioner</SectionTitle>
        <div className="space-y-2.5">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            const expandable = !c.action;
            const open = openChannel === c.id;

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
                {expandable
                  ? <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
                  : <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />}
              </>
            );

            if (c.action) {
              return (
                <a key={c.id} href={c.action}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">{inner}</a>
              );
            }

            return (
              <div key={c.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <button onClick={() => setOpenChannel(open ? null : c.id)} aria-expanded={open}
                  className="flex w-full items-start gap-3 p-3 text-left">{inner}</button>

                {open && c.kind === "whatsapp" && (
                  <div className="border-t border-slate-100 p-3">
                    <p className="text-xs leading-relaxed text-slate-600">
                      Save the number below, then send the word
                      <span className="font-semibold text-slate-900"> {KHETHA_CONTACT.whatsappKeyword} </span>
                      to open a chat. A practitioner replies within one working day, {KHETHA_CONTACT.hours}.
                    </p>
                    <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">{KHETHA_CONTACT.whatsapp}</p>
                    <div className="mt-3 flex gap-2">
                      <a href={waHref} target="_blank" rel="noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg k-bg-005A36 py-2.5 text-[11px] font-semibold text-white">
                        <ExternalLink className="h-3.5 w-3.5" />Open WhatsApp
                      </a>
                      <button onClick={() => copy(KHETHA_CONTACT.whatsapp)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2.5 text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200">
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy number"}
                      </button>
                    </div>
                    {!KHETHA_CONTACT.whatsappVerified && (
                      <p className="mt-2.5 rounded-lg k-bg-FBF5E7 p-2.5 text-[10px] leading-relaxed k-tx-6B5307">
                        Demonstration number. The live Khetha WhatsApp line is provisioned by DHET before launch.
                      </p>
                    )}
                  </div>
                )}

                {open && c.kind === "callback" && (
                  <div className="border-t border-slate-100 p-3">
                    <p className="text-xs leading-relaxed text-slate-600">
                      Leave a number and a practitioner phones you — no airtime needed at your end. Or dial the free
                      network code, which works on any handset.
                    </p>
                    <button onClick={() => setCallbackOpen(true)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg k-bg-005A36 py-2.5 text-[11px] font-semibold text-white">
                      <Phone className="h-3.5 w-3.5" />Request a call back
                    </button>
                    <a href={`tel:${encodeURIComponent(KHETHA_CONTACT.pleaseCallUssdTel)}`}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2.5 text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200">
                      Dial {KHETHA_CONTACT.pleaseCallUssd}
                    </a>
                  </div>
                )}

                {open && c.kind === "walkin" && (
                  <div className="border-t border-slate-100 p-3">
                    <div className="mb-3"><LocationButton nearby={nearby} label="Use my location" /></div>
                    <div className="space-y-2">
                      {centres.slice(0, 4).map((p) => (
                        <div key={p.id} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                            <p className="text-[11px] text-slate-600">
                              {p.city}, {p.province}{p.km != null ? ` · ${fmtKm(p.km)}` : ""}
                            </p>
                          </div>
                          <a href={`tel:${p.phone.replace(/\s/g, "")}`}
                            className="shrink-0 text-[11px] font-semibold k-tx-005A36">Call</a>
                        </div>
                      ))}
                    </div>
                    {go && (
                      <button onClick={() => go("explore:providers")}
                        className="mt-3 w-full text-center text-[11px] font-semibold k-tx-005A36">
                        See every learning provider
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle hint="Tap the bell to be reminded">Events near you</SectionTitle>
        <div className="mb-2.5"><LocationButton nearby={nearby} label="Sort by what is closest" /></div>
        <div className="space-y-2.5">
          {events.map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-FBF5E7 k-tx-6B5307">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-600">{e.date} · {e.venue}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill tone="slate">{e.type}</Pill>
                  <Pill tone="slate">{e.province}</Pill>
                  {e.km != null && <Pill tone="green" icon={Navigation}>{fmtKm(e.km)}</Pill>}
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
        <SectionTitle hint="Refreshed daily">Common questions</SectionTitle>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f) => (
            <div key={f.q}>
              <button onClick={() => setOpenFaq(openFaq === f.q ? null : f.q)}
                aria-expanded={openFaq === f.q}
                className="flex w-full items-center gap-2 p-3 text-left">
                <CircleHelp className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="flex-1 text-sm font-medium text-slate-900">{f.q}</span>
                <ChevronRight className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${openFaq === f.q ? "rotate-90" : ""}`} />
              </button>
              {openFaq === f.q && (
                <p className="px-3 pb-3 text-xs leading-relaxed text-slate-600">{f.a}</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] leading-relaxed text-slate-600">
          <RefreshCw className="h-3 w-3 shrink-0" />
          {learner?.grade
            ? `A different set each day, chosen for Grade ${learner.grade}. Ask the advisor anything that is not here.`
            : "A different set each day. Ask the advisor anything that is not here."}
        </p>
      </div>

      {callbackOpen && <CallbackModal learner={learner} onClose={() => setCallbackOpen(false)} />}
    </div>
  );
}
