// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useRef, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import { LANGUAGES } from '../../data/i18n';
import { GREETING, SCRIPTS, FALLBACK } from '../../data/advisorScript';
import { HorizontalScroller } from '../ui/HorizontalScroller';
import { askAdvisor } from '../../lib/api';

export function Advisor({ appLang, profile, offline }) {
  /* Deliberately separate from the app language: a learner may read the
     interface in Setswana but prefer to chat in English, or the reverse. */
  const [lang, setLang] = useState(appLang);
  const [messages, setMessages] = useState([{ from: "bot", text: GREETING[lang] || GREETING.en }]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, typing]);

  // Instant, free, works offline — tried first for the handful of most
  // common questions. Anything that doesn't match falls through to a real
  // AI call (see api.askAdvisor / backend/Services/AdvisorService.cs); if
  // that's unavailable (offline, no session, key not configured, network
  // error), this degrades to the same static fallback text rather than
  // breaking the chat.
  const reply = async (text) => {
    const lower = text.toLowerCase();
    const hit = SCRIPTS.find((s) => s.match.some((m) => lower.includes(m)));
    if (hit) return hit.replies[lang] || hit.replies.en;

    if (!offline) {
      try {
        const { reply: aiReply } = await askAdvisor(text, lang);
        return aiReply;
      } catch { /* fall through to the static fallback below */ }
    }
    return FALLBACK[lang] || FALLBACK.en;
  };

  const send = async (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { from: "me", text: clean }]);
    setDraft(""); setTyping(true);
    const botReply = await reply(clean);
    setTyping(false);
    setMessages((m) => [...m, { from: "bot", text: botReply }]);
  };

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="shrink-0 border-b k-bd-00432A k-bg-005A36 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full k-bg-D4AF37 text-sm font-bold k-tx-0F172A">K</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Khetha advisor</p>
            <p className="text-[11px] k-tx-BFE5D4">
              {offline ? "Offline — answering from the cached guide" : "Online · answers in six languages"}
            </p>
          </div>
        </div>
        <HorizontalScroller className="mt-3 flex gap-1.5 pb-0.5" dotClassName="bg-white/30" dotActiveClassName="bg-white">
          {LANGUAGES.map((l) => (
            <button key={l.code}
              onClick={() => { setLang(l.code); setMessages((m) => [...m, { from: "bot", text: GREETING[l.code] }]); }}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                lang === l.code ? "k-bg-D4AF37 text-slate-900" : "k-bg-00432A k-tx-BFE5D4"
              }`}>
              {l.label}
            </button>
          ))}
        </HorizontalScroller>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {profile.careerChoice && (
          <p className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
            Advisor can see your {profile.careerChoice.code.join("")} interest code
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
              m.from === "me" ? "rounded-br-md k-bg-005A36 text-white" : "rounded-bl-md bg-white text-slate-800"
            }`}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-xs text-slate-600 shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />Khetha is typing
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="-mb-1 shrink-0 px-3 pb-2">
        <HorizontalScroller className="flex gap-2">
          {SCRIPTS.map((s) => (
            <button key={s.chip} onClick={() => send(s.chip)}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold k-tx-005A36 ring-1 k-rg-A8DCC5">
              {s.chip}
            </button>
          ))}
        </HorizontalScroller>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-2.5">
        <div className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(draft)}
            placeholder="Ask about subjects, APS or funding"
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          <button onClick={() => send(draft)} aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full k-bg-005A36 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
