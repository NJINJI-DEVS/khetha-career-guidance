// "Please Call Me" — for learners with no airtime. Captures the minimum a
// practitioner needs to phone back, and nothing else: no ID, no address, no
// marks. Also surfaces the free network USSD string, which costs nothing and
// works on a feature phone with a flat balance.
import { useState } from 'react';
import { Phone, Check, Clock } from 'lucide-react';
import { KHETHA_CONTACT } from '../../data/outreach';
import { ModalShell } from '../ui/ModalShell';

const SLOTS = ["Any time, 08:00–16:30", "Morning, 08:00–12:00", "Afternoon, 12:00–16:30", "After school, 14:00–16:30"];

export function CallbackModal({ learner, onClose }) {
  const [name, setName] = useState(learner?.name && learner.name !== "Guest" ? learner.name : "");
  const [number, setNumber] = useState("");
  const [slot, setSlot] = useState(SLOTS[0]);
  const [topic, setTopic] = useState("");
  const [sent, setSent] = useState(false);

  const digits = number.replace(/\D/g, "");
  const numberOk = digits.length === 9 || (digits.length === 10 && digits.startsWith("0"));
  const ready = name.trim().length > 1 && numberOk;

  const input = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37";

  if (sent) {
    return (
      <ModalShell title="Call back requested" onClose={onClose}>
        <div className="grid place-items-center py-4">
          <span className="grid h-14 w-14 place-items-center rounded-full k-bg-E7F4EE k-tx-005A36">
            <Check className="h-7 w-7" />
          </span>
        </div>
        <p className="text-center text-sm font-semibold text-slate-900">A practitioner will call you</p>
        <p className="mt-1.5 text-center text-xs leading-relaxed text-slate-600">
          We have your number as <span className="font-semibold text-slate-900">{number}</span>, for {slot.toLowerCase()}.
          Calls come from the Khetha helpline, {KHETHA_CONTACT.helpline}, so save it — an unknown number is easy to ignore.
        </p>
        <p className="mt-3 rounded-xl bg-slate-100 p-3 text-[11px] leading-relaxed text-slate-600">
          Requests placed outside {KHETHA_CONTACT.hours} are answered the next working day.
        </p>
        <button onClick={onClose}
          className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white">
          Done
        </button>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Request a call back" onClose={onClose}>
      <p className="text-xs leading-relaxed text-slate-600">
        You do not need airtime. Give us a number and a practitioner phones you — usually the same working day.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="cb-name" className="text-xs font-medium text-slate-700">Your name</label>
          <input id="cb-name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Thandi Mokoena" className={input} />
        </div>
        <div>
          <label htmlFor="cb-num" className="text-xs font-medium text-slate-700">Number to call</label>
          <input id="cb-num" value={number} inputMode="numeric"
            onChange={(e) => setNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 12))}
            placeholder="071 234 5678" className={input} />
          {number && !numberOk && (
            <p className="mt-1 text-[11px] k-tx-9B1C14">Enter a 10-digit South African number.</p>
          )}
        </div>
        <div>
          <label htmlFor="cb-slot" className="text-xs font-medium text-slate-700">Best time to reach you</label>
          <select id="cb-slot" value={slot} onChange={(e) => setSlot(e.target.value)} className={input}>
            {SLOTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cb-topic" className="text-xs font-medium text-slate-700">What is it about? (optional)</label>
          <input id="cb-topic" value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="NSFAS, subject choice, my APS…" className={input} />
        </div>
      </div>

      <button onClick={() => setSent(true)} disabled={!ready}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        <Phone className="h-4 w-4" />Request the call
      </button>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-900">
          <Clock className="h-3.5 w-3.5" />No smartphone? Dial this instead
        </p>
        <a href={`tel:${encodeURIComponent(KHETHA_CONTACT.pleaseCallUssdTel)}`}
          className="mt-1.5 block text-sm font-bold k-tx-005A36">
          {KHETHA_CONTACT.pleaseCallUssd}
        </a>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
          Free on every South African network, and it works on any handset.
        </p>
      </div>
    </ModalShell>
  );
}
