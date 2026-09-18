// Checklist Part B — guardian consent for learners under 18.
//
// POPIA treats a child's personal information as special. A minor cannot give
// valid consent for its processing, so where the learner states they are under
// 18 a guardian must be named before anything is stored.
import { useState } from 'react';
import { ShieldCheck, Users, Check } from 'lucide-react';

const RELATIONS = ["Parent", "Grandparent", "Legal guardian", "Older sibling (18+)", "Teacher acting in loco parentis"];

export function GuardianConsent({ onDone, onDefer }) {
  const [age, setAge] = useState(null);          /* "minor" | "adult" | null */
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Parent");
  const [contact, setContact] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const contactOk = /^[\d\s+]{9,14}$/.test(contact.trim());
  const ready = name.trim().length > 2 && contactOk && confirmed;

  const input = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37";

  if (age === null) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ShieldCheck className="h-4 w-4" />How old are you?
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          Learners under 18 need a parent or guardian to agree before we store anything. It takes one screen.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => setAge("minor")}
            className="rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-900">Under 18</button>
          <button onClick={() => { setAge("adult"); onDone({ minor: false }); }}
            className="rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-900">18 or older</button>
        </div>
      </div>
    );
  }

  if (age === "adult") return null;

  return (
    <div className="rounded-2xl border k-bd-E4CE8A k-bg-FBF5E7 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold k-tx-6B5307">
        <Users className="h-4 w-4" />Who is your parent or guardian?
      </p>
      <p className="mt-1.5 text-xs leading-relaxed k-tx-6B5307">
        We store only their name and a contact number, so DHET can confirm they agreed. Nothing else about them, and
        nothing extra about you.
      </p>

      <div className="mt-3 space-y-3">
        <div>
          <label htmlFor="g-name" className="text-xs font-medium text-slate-700">Their full name</label>
          <input id="g-name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Nomsa Mabaso" className={input} />
        </div>
        <div>
          <label htmlFor="g-rel" className="text-xs font-medium text-slate-700">Their relationship to you</label>
          <select id="g-rel" value={relation} onChange={(e) => setRelation(e.target.value)} className={input}>
            {RELATIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="g-num" className="text-xs font-medium text-slate-700">Their phone number</label>
          <input id="g-num" value={contact} inputMode="numeric"
            onChange={(e) => setContact(e.target.value.replace(/[^\d\s+]/g, "").slice(0, 14))}
            placeholder="071 234 5678" className={input} />
        </div>

        <button onClick={() => setConfirmed((v) => !v)} className="flex items-start gap-2.5 text-left">
          <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
            confirmed ? "k-bd-005A36 k-bg-005A36 text-white" : "border-slate-300 bg-white"
          }`}>
            {confirmed && <Check className="h-3.5 w-3.5" />}
          </span>
          <span className="text-[11px] leading-relaxed text-slate-700">
            I have shown this to them and they agree that Khetha may store my career profile. DHET may contact them to
            confirm.
          </span>
        </button>
      </div>

      <button onClick={() => onDone({ minor: true, guardian: { name, relation, contact } })} disabled={!ready}
        className="mt-4 w-full rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        Continue with guardian consent
      </button>
      <button onClick={onDefer}
        className="mt-2 w-full rounded-xl bg-white py-2.5 text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200">
        Not now — go back
      </button>
      <p className="mt-2 text-center text-[10px] leading-relaxed k-tx-6B5307">
        Nothing is stored until a guardian is named. You can come back and finish this at any time.
      </p>
    </div>
  );
}
