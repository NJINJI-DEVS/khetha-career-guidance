// Extracted from App.jsx (Stage 5 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, AlertTriangle, Send } from 'lucide-react';
import { MENTOR_ROLES } from '../../data/mentors';
import { redact } from '../../engines/redact';

/* ---- Guarded messaging -------------------------------------------- */
export function MentorChat({ mentor, onBack }) {
  const [messages, setMessages] = useState([
    { from: "them", text: `Hi! I saw your request. Which topic in ${mentor.subjects[0]} is giving you the most trouble?` },
  ]);
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState(null);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages]);

  const send = () => {
    const raw = draft.trim();
    if (!raw) return;
    const { text, found } = redact(raw);
    setMessages((m) => [...m, { from: "me", text, redacted: found }]);
    setWarning(found.length ? found : null);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "them", text: "Sharp. Send me the question you got stuck on and we'll work it through in our session." }]);
    }, 700);
  };

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="shrink-0 border-b k-bd-00432A k-bg-005A36 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back to mentors"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-full k-bg-D4AF37 text-sm font-bold text-slate-900">
            {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{mentor.name}</p>
            <p className="truncate text-[11px] k-tx-BFE5D4">{MENTOR_ROLES[mentor.role].label}</p>
          </div>
        </div>
      </div>

      <p className="flex shrink-0 items-start gap-2 border-b border-slate-200 bg-white px-4 py-2.5 text-[11px] leading-relaxed text-slate-600">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 k-tx-005A36" />
        External phone numbers, social handles and personal links are redacted for learner protection. Keep tutoring
        inside Khetha so it stays logged and safe.
      </p>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
              m.from === "me" ? "rounded-br-md k-bg-005A36 text-white" : "rounded-bl-md bg-white text-slate-800"
            }`}>
              {m.text}
              {m.redacted?.length > 0 && (
                <span className="mt-1.5 block text-[10px] italic opacity-80">
                  {m.redacted.join(" and ")} removed automatically
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {warning && (
        <p className="mx-3 mb-2 flex items-start gap-2 rounded-xl k-bg-FBEAE8 p-2.5 text-[11px] leading-relaxed k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          We removed a {warning.join(" and ")} from that message. Sharing contact details moves the conversation
          somewhere we cannot protect you.
        </p>
      )}

      <div className="shrink-0 border-t border-slate-200 bg-white p-2.5">
        <div className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message your mentor"
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          <button onClick={send} aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full k-bg-005A36 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
