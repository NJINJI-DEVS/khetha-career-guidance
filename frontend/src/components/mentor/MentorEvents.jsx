// A mentor offering a seminar, work-shadowing day or site visit.
//
// The three long-form fields are not paperwork. An administrator has to decide
// whether to send learners to a physical address on the strength of what is
// written here, so the form asks for what that decision needs — what the
// session covers, and what a learner walks away with — rather than a title and
// a date.

import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, MapPin, Users, Plus, Loader2, Globe, CheckCircle2,
  Clock, XCircle, X,
} from 'lucide-react';
import { requestMentorEvent, getMyMentorEvents } from '../../lib/api';
import { PROVINCES } from '../../data/provinces';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';

const KINDS = [
  { key: "seminar", label: "Seminar", hint: "A talk or workshop for a group of learners" },
  { key: "shadowing", label: "Work shadowing", hint: "Learners spend a day alongside you at work" },
  { key: "site_visit", label: "Site visit", hint: "A guided visit to your workplace or campus" },
  { key: "talk", label: "Career talk", hint: "A shorter session at a school or online" },
];

const STATUS = {
  pending: { tone: "gold", icon: Clock, label: "Waiting for approval" },
  approved: { tone: "green", icon: CheckCircle2, label: "Approved" },
  declined: { tone: "red", icon: XCircle, label: "Declined" },
  cancelled: { tone: "slate", icon: XCircle, label: "Cancelled" },
};

// The backend requires two days' notice. Defaulting the picker past that point
// saves the mentor filling the whole form only to be rejected on submit.
const earliest = () => {
  const d = new Date(Date.now() + 3 * 86400000);
  d.setHours(9, 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

const EMPTY = {
  kind: "seminar", title: "", description: "", impact: "",
  startsAt: "", endsAt: "", venue: "", province: "", capacity: "", isOnline: false,
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37";

function RequestForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ ...EMPTY, startsAt: earliest() });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await requestMentorEvent({
        kind: form.kind,
        title: form.title.trim(),
        description: form.description.trim(),
        impact: form.impact.trim(),
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        venue: form.venue.trim(),
        province: form.province,
        capacity: Number(form.capacity),
        isOnline: form.isOnline,
      });
      onCreated();
    } catch (err) {
      // The backend's validation messages are written for the mentor, so show
      // them rather than a generic failure.
      setError(err.body?.error || err.message || "Could not send that request.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3.5 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Offer a session</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
            An administrator reviews this before any learner sees it. Allow at least two days.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="rounded-lg bg-slate-100 p-1.5 text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <Field label="What kind of session?">
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <button key={k.key} type="button" onClick={() => setForm((f) => ({ ...f, kind: k.key }))}
              className={`rounded-xl px-3 py-2 text-left text-[11px] font-semibold transition-colors ${
                form.kind === k.key ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700"
              }`}>
              {k.label}
              <span className={`mt-0.5 block text-[10px] font-normal leading-tight ${
                form.kind === k.key ? "text-white/80" : "text-slate-600"
              }`}>{k.hint}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Title">
        <input required value={form.title} onChange={set("title")} className={inputCls}
          placeholder="A day in a civil engineering practice" />
      </Field>

      <Field label="What the session covers"
        hint="What will learners actually see and do? Be specific — this is what an administrator reviews.">
        <textarea required rows={3} value={form.description} onChange={set("description")} className={inputCls}
          placeholder="Learners sit in on a site meeting, walk a live build with the resident engineer, and see how a drawing becomes a structure." />
      </Field>

      <Field label="What learners get out of it"
        hint="The impact. What can a learner do, or decide, after attending that they could not before?">
        <textarea required rows={3} value={form.impact} onChange={set("impact")} className={inputCls}
          placeholder="A learner weighing engineering against architecture sees the day-to-day of both roles before choosing subjects in Grade 10." />
      </Field>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Starts">
          <input required type="datetime-local" min={earliest()} value={form.startsAt}
            onChange={set("startsAt")} className={inputCls} />
        </Field>
        <Field label="Ends (optional)">
          <input type="datetime-local" value={form.endsAt} onChange={set("endsAt")} className={inputCls} />
        </Field>
      </div>

      <label className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3">
        <input type="checkbox" checked={form.isOnline} onChange={set("isOnline")}
          className="h-4 w-4 rounded border-slate-300" />
        <span className="text-xs text-slate-800">This session is online</span>
      </label>

      <Field label={form.isOnline ? "Joining details" : "Venue"}
        hint={form.isOnline
          ? "Where learners join — a meeting link, or how they will receive one."
          : "The full address. Learners plan transport around this."}>
        <input required value={form.venue} onChange={set("venue")} className={inputCls}
          placeholder={form.isOnline ? "Link sent by email the day before" : "12 Main Road, Claremont, Cape Town"} />
      </Field>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Province" hint={form.isOnline ? "Online sessions still reach every province." : undefined}>
          <select required={!form.isOnline} value={form.province} onChange={set("province")} className={inputCls}>
            <option value="">Select a province</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="How many learners can you take?"
          hint="Learners accept a place, so this is the number you are committing to host.">
          <input type="number" required min="1" max="1000" value={form.capacity}
            onChange={set("capacity")} className={inputCls} placeholder="30" />
        </Field>
      </div>

      {error && <p className="rounded-xl k-bg-FBEAE8 p-3 text-xs leading-relaxed k-tx-9B1C14">{error}</p>}

      <button type="submit" disabled={busy || !form.capacity}
        className="flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
        Send for approval
      </button>
    </form>
  );
}

export function MentorEvents({ verified, onOpenRegister }) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [composing, setComposing] = useState(false);

  const load = useCallback(() => {
    getMyMentorEvents()
      .then((d) => { setEvents(d); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(load, [load]);

  if (composing) {
    return <RequestForm onClose={() => setComposing(false)}
      onCreated={() => { setComposing(false); setStatus("loading"); load(); }} />;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Your sessions</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
            Seminars, work-shadowing days and site visits you have offered.
          </p>
        </div>
        {verified && (
          <button onClick={() => setComposing(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl k-bg-005A36 px-3 py-2 text-xs font-semibold text-white">
            <Plus className="h-4 w-4" />Offer one
          </button>
        )}
      </div>

      {!verified && (
        <p className="rounded-xl k-bg-FBF5E7 p-3 text-[11px] leading-relaxed k-tx-6B5307">
          Once an administrator approves your application you can offer seminars and work-shadowing days here.
        </p>
      )}

      {status === "loading" && (
        <p className="flex items-center gap-2 text-xs text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading your sessions…
        </p>
      )}
      {status === "error" && <p className="text-xs text-slate-600">Couldn't load your sessions right now.</p>}

      {status === "ready" && events.length === 0 && verified && (
        <EmptyState icon={CalendarDays} title="No sessions yet"
          body="Offer a seminar or a work-shadowing day. Once approved it appears in learners' calendars with a reminder."
          cta="Offer a session" onCta={() => setComposing(true)} />
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {events.map((e) => {
          const s = STATUS[e.status] || STATUS.pending;
          const Icon = s.icon;
          return (
            <article key={e.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-slate-900">{e.title}</h4>
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-600">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {new Date(e.startsAt).toLocaleString("en-ZA", {
                  weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
                {e.isOnline ? <Globe className="h-3.5 w-3.5 shrink-0" /> : <MapPin className="h-3.5 w-3.5 shrink-0" />}
                {e.venue}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Pill tone={s.tone} icon={Icon}>{s.label}</Pill>
                {e.capacity != null && (
                  <Pill tone={e.status === "approved" ? "green" : "slate"} icon={Users}>
                    {e.status === "approved"
                      ? `${e.slotsTaken ?? 0} of ${e.capacity} places taken`
                      : `${e.capacity} places`}
                  </Pill>
                )}
              </div>
              {e.status === "approved" && (
                <button onClick={() => onOpenRegister?.(e)}
                  className="mt-2.5 w-full rounded-xl bg-slate-100 py-2 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200">
                  See who is coming
                </button>
              )}
              {e.decisionNote && (
                <p className="mt-2.5 rounded-xl bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-700">
                  <span className="font-semibold">From the reviewer: </span>{e.decisionNote}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
