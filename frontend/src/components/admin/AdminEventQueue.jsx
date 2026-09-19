// Admin review of mentor event requests.
//
// An approved event puts an adult in a room with learners, usually at a
// physical address, so this screen is a safeguarding decision rather than a
// scheduling one. It shows the four things that decision turns on — who is
// running it, what it covers, what learners get out of it, and where and when —
// and requires a reason on decline so the mentor can fix and resubmit.

import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, MapPin, Users, Clock, Check, X, ChevronRight, Loader2,
  Globe, AlertTriangle, ClipboardList,
} from 'lucide-react';
import { getAllMentorEvents, approveMentorEvent, declineMentorEvent } from '../../lib/api';
import { EmptyState } from '../ui/EmptyState';
import { Pill } from '../ui/Pill';
import { Screen } from '../ui/Screen';

const KIND_LABEL = {
  seminar: "Seminar",
  shadowing: "Work shadowing",
  site_visit: "Site visit",
  talk: "Talk",
};

const fmtWhen = (iso) =>
  new Date(iso).toLocaleString("en-ZA", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const daysAway = (iso) => Math.ceil((new Date(iso) - Date.now()) / 86400000);

function EventDetail({ event, onBack, onDecided }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const decide = async (fn, requiresNote) => {
    if (requiresNote && note.trim().length < 5) {
      setError("Give the mentor a reason — a decline they cannot act on wastes everyone's time.");
      return;
    }
    setBusy(true); setError("");
    try {
      await fn(event.id, note.trim() || null);
      onDecided();
    } catch (e) {
      setError(e.message || "Could not record that decision.");
      setBusy(false);
    }
  };

  const away = daysAway(event.startsAt);

  return (
    <Screen onBack={onBack} title={event.title}
      subtitle={`${KIND_LABEL[event.kind] || event.kind} · ${event.mentorName}`}>

      {away < 7 && event.status === "pending" && (
        <div className="rounded-2xl border k-bd-E4CE8A k-bg-FBF5E7 p-3.5">
          <p className="flex items-center gap-2 text-sm font-semibold k-tx-6B5307">
            <AlertTriangle className="h-4 w-4" />Only {away} days away
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-700">
            Learners need notice to arrange transport and permission from home. Decide soon or decline so the
            mentor can rebook.
          </p>
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {[
          { icon: CalendarDays, label: "When", value: fmtWhen(event.startsAt) + (event.endsAt ? ` – ${fmtWhen(event.endsAt)}` : "") },
          { icon: event.isOnline ? Globe : MapPin, label: event.isOnline ? "Online" : "Venue", value: event.venue },
          { icon: MapPin, label: "Province", value: event.province || "Not given" },
          { icon: Users, label: "Capacity", value: event.capacity ? `${event.capacity} learners` : "No limit given" },
        ].map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{r.label}</p>
                <p className="mt-0.5 text-xs text-slate-900">{r.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">What the session covers</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{event.description}</p>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">What learners get out of it</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{event.impact}</p>
      </div>

      {event.status === "pending" ? (
        <>
          <div className="mt-4">
            <label htmlFor="ev-note" className="text-xs font-medium text-slate-700">
              Note to the mentor <span className="text-slate-500">(required to decline)</span>
            </label>
            <textarea id="ev-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="What needs to change before this can run?"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
          </div>

          {error && <p className="mt-2 text-xs k-tx-9B1C14">{error}</p>}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button disabled={busy} onClick={() => decide(approveMentorEvent, false)}
              className="flex items-center justify-center gap-1.5 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Approve
            </button>
            <button disabled={busy} onClick={() => decide(declineMentorEvent, true)}
              className="flex items-center justify-center gap-1.5 rounded-xl k-bg-B3261E py-3 text-sm font-semibold text-white k-dis">
              <X className="h-4 w-4" />Decline
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            Approving puts this in every learner's calendar in {event.province || "the province"}. Declining notifies
            the mentor with your note.
          </p>
        </>
      ) : (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-900">
            {event.status === "approved" ? "Approved" : event.status === "declined" ? "Declined" : event.status}
          </p>
          {event.decidedAt && (
            <p className="mt-0.5 text-[11px] text-slate-600">
              {new Date(event.decidedAt).toLocaleDateString("en-ZA")}
            </p>
          )}
          {event.decisionNote && <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">{event.decisionNote}</p>}
        </div>
      )}
    </Screen>
  );
}

export function AdminEventQueue() {
  const [filter, setFilter] = useState("pending");
  const [events, setEvents] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(() => {
    setStatus("loading");
    getAllMentorEvents()
      .then((d) => { setEvents(d); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(load, [load]);

  const open = events.find((e) => e.id === openId);
  if (open) {
    // Screen brings its own p-4 and this renders inside the already-padded
    // approvals wrapper, so cancel the horizontal doubling — 32px of gutter on
    // a 360px phone leaves the venue address wrapping mid-word.
    return (
      <div className="-mx-4">
        <EventDetail event={open} onBack={() => setOpenId(null)}
          onDecided={() => { setOpenId(null); load(); }} />
      </div>
    );
  }

  const counts = {
    pending: events.filter((e) => e.status === "pending").length,
    approved: events.filter((e) => e.status === "approved").length,
    declined: events.filter((e) => e.status === "declined").length,
  };
  const shown = events.filter((e) => e.status === filter);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">Seminars, work shadowing and site visits</p>
        <p className="mt-0.5 text-lg font-semibold">{counts.pending} awaiting your decision</p>
        <p className="mt-2 text-[11px] leading-relaxed k-tx-BFE5D4">
          Nothing reaches a learner's calendar until it is approved here. An approved event puts an adult in a room
          with learners, so treat it as a safeguarding decision.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[["pending", "Pending"], ["approved", "Approved"], ["declined", "Declined"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`rounded-lg px-1.5 py-2 text-[10px] font-semibold transition-colors ${
              filter === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}>{l} ({counts[k]})</button>
        ))}
      </div>

      {status === "loading" && (
        <p className="flex items-center gap-2 p-4 text-xs text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading events…
        </p>
      )}
      {status === "error" && <p className="p-4 text-xs text-slate-600">Couldn't load events right now.</p>}

      {status === "ready" && shown.length === 0 && (
        <EmptyState icon={ClipboardList} title={`No ${filter} events`}
          body="Mentors request seminars and work-shadowing days from their workspace. They land here for review." />
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {shown.map((e) => {
          const away = daysAway(e.startsAt);
          return (
            <button key={e.id} onClick={() => setOpenId(e.id)}
              className="rounded-2xl border border-l-4 border-slate-200 bg-white p-4 text-left"
              style={{ borderLeftColor: e.status === "pending" ? "#D4AF37" : e.status === "approved" ? "#00784A" : "#B3261E" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{e.title}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-600">{e.mentorName} · {KIND_LABEL[e.kind] || e.kind}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />{fmtWhen(e.startsAt)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
                {e.isOnline ? <Globe className="h-3.5 w-3.5 shrink-0" /> : <MapPin className="h-3.5 w-3.5 shrink-0" />}
                {e.venue}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {e.status === "pending" && away <= 7 && (
                  <Pill tone="red" icon={Clock}>{away} days away</Pill>
                )}
                {e.province && <Pill tone="slate">{e.province}</Pill>}
                {e.capacity && <Pill tone="slate" icon={Users}>{e.capacity}</Pill>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
