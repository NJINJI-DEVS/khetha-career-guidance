// Checklist Part B — guardian consent for learners under 18.
//
// POPIA treats a child's personal information as special. A minor cannot give
// valid consent for its processing, so where the learner is under 18 a
// guardian must be named before anything is stored.
//
// Age used to be self-declared via an "Under 18 / 18 or older" button pair —
// nothing stopped a minor from just clicking "18 or older" to skip this, and
// the answer was never actually recorded anywhere. Collecting the real date
// of birth instead gives an honest, unspoofable-by-a-typo age determination,
// and — since it's threaded through to the real Matriculant record (see
// App.jsx/OnboardingScreen.jsx) — a real, persisted fact about the account
// rather than a one-off signup-time decision.
import { useState, useMemo } from 'react';
import { ShieldCheck, Users, Check } from 'lucide-react';
import { calculateAge } from '../../engines/age';

const RELATIONS = ["Parent", "Grandparent", "Legal guardian", "Older sibling (18+)", "Teacher acting in loco parentis"];

const todayIso = () => new Date().toISOString().slice(0, 10);
const oldestIso = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 100);
  return d.toISOString().slice(0, 10);
};

export function GuardianConsent({ onDone, onDefer }) {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobConfirmed, setDobConfirmed] = useState(false); /* Continue clicked with a valid DOB */
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Parent");
  const [contact, setContact] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const age = useMemo(() => (dateOfBirth ? calculateAge(dateOfBirth) : null), [dateOfBirth]);
  const dobValid = age !== null && age >= 0 && age <= 100;
  const isMinor = dobValid && age < 18;

  const contactOk = /^[\d\s+]{9,14}$/.test(contact.trim());
  const ready = name.trim().length > 2 && contactOk && confirmed;

  const input = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37";

  if (!dobConfirmed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ShieldCheck className="h-4 w-4" />What's your date of birth?
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          Learners under 18 need a parent or guardian to agree before we store anything. It takes one more screen.
        </p>
        <div className="mt-3">
          <label htmlFor="g-dob" className="text-xs font-medium text-slate-700">Date of birth</label>
          <input id="g-dob" type="date" value={dateOfBirth} min={oldestIso()} max={todayIso()}
            onChange={(e) => setDateOfBirth(e.target.value)} className={input} />
        </div>
        {dateOfBirth && !dobValid && (
          <p className="mt-1.5 text-[11px] k-tx-9B1C14">That doesn't look right — check the date.</p>
        )}
        <button
          onClick={() => (isMinor ? setDobConfirmed(true) : onDone({ minor: false, dateOfBirth }))}
          disabled={!dobValid}
          className="mt-3 w-full rounded-xl k-bg-005A36 py-2.5 text-xs font-semibold text-white k-dis">
          Continue
        </button>
      </div>
    );
  }

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

      <button onClick={() => onDone({ minor: true, dateOfBirth, guardian: { name, relation, contact } })} disabled={!ready}
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
