// Wired to the real backend: messages are fetched/sent via useMessages, which
// calls the real, server-side-redacted MessagesController — the previous version
// ran redact() locally and fabricated a canned auto-reply. Takes a `request`
// (an accepted HelpRequestDto) rather than a bare mentor, since the backend only
// allows messaging on an accepted help request thread.
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ShieldCheck, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useMessages } from '../../hooks/useMessages';

export function MentorChat({ request, onBack }) {
  const { messages, loading, send: sendReal } = useMessages(request.id);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages]);

  const send = async () => {
    const raw = draft.trim();
    if (!raw) return;
    setSending(true); setError("");
    try {
      await sendReal(raw);
      setDraft("");
    } catch (err) {
      setError(err.message || "Couldn't send that message.");
    } finally {
      setSending(false);
    }
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
            {request.mentorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{request.mentorName}</p>
            <p className="truncate text-[11px] k-tx-BFE5D4">{request.subject}</p>
          </div>
        </div>
      </div>

      <p className="flex shrink-0 items-start gap-2 border-b border-slate-200 bg-white px-4 py-2.5 text-[11px] leading-relaxed text-slate-600">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 k-tx-005A36" />
        External phone numbers, social handles and personal links are redacted automatically before a message is
        ever stored — this happens on our server, not just in this screen.
      </p>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {loading && <p className="text-center text-xs text-slate-500">Loading messages…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-xs text-slate-500">No messages yet — say hello.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderRole === "mentor" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
              m.senderRole === "mentor" ? "rounded-bl-md bg-white text-slate-800" : "rounded-br-md k-bg-005A36 text-white"
            }`}>
              {m.body}
              {m.redactedTypes?.length > 0 && (
                <span className="mt-1.5 block text-[10px] italic opacity-80">
                  {m.redactedTypes.join(" and ")} removed automatically
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="mx-3 mb-2 flex items-start gap-2 rounded-xl k-bg-FBEAE8 p-2.5 text-[11px] leading-relaxed k-tx-9B1C14">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}

      <div className="shrink-0 border-t border-slate-200 bg-white p-2.5">
        <div className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && send()}
            placeholder="Message your mentor"
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          <button onClick={send} disabled={sending} aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full k-bg-005A36 text-white disabled:opacity-60">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
