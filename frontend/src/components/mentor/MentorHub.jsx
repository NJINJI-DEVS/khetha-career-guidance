// Wired to the real backend: mentors come from useMentors (GET /api/mentors), and
// the old "inbox" tab (which incorrectly let a STUDENT accept/decline their own
// sent requests — that's the mentor's call, already handled correctly in
// MentorWorkspace) is replaced with a read-only "My requests" list. Messaging only
// appears once a request is accepted, matching the backend's actual rule — the
// mock version's "Message" button on every mentor card (regardless of any
// request) has been removed (see MentorCard).
import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { MENTOR_ROLES } from '../../data/mentors';
import { PROVINCES } from '../explore/ProvidersDirectory';
import { SearchBar } from '../ui/SearchBar';
import { Chips } from '../ui/Chips';
import { SectionTitle } from '../ui/SectionTitle';
import { EmptyState } from '../ui/EmptyState';
import { RoadmapCallout } from '../ui/RoadmapCallout';
import { Pill } from '../ui/Pill';
import { MentorChat } from './MentorChat';
import { RequestLetterModal } from './RequestLetterModal';
import { MentorCard } from './MentorCard';
import { useMentors } from '../../hooks/useMentors';

/* ---- Hub ----------------------------------------------------------- */
export function MentorHub({ learner, aps, requests, onCreateRequest }) {
  const [view, setView] = useState("find");
  const [role, setRole] = useState("all");
  const [province, setProvince] = useState("All");
  const [q, setQ] = useState("");
  const [requesting, setRequesting] = useState(null);
  const [chatting, setChatting] = useState(null); // a request row, not a mentor

  const { mentors, loading: mentorsLoading } = useMentors();

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return mentors
      .filter((m) => (role === "all" ? true : m.role === role))
      .filter((m) => (province === "All" ? true : m.province === province))
      .filter((m) => !s || m.fullName.toLowerCase().includes(s) ||
        (m.subjects || []).join(" ").toLowerCase().includes(s) ||
        (m.institutionOrEmployer || "").toLowerCase().includes(s));
  }, [mentors, role, province, q]);

  if (chatting) return <MentorChat request={chatting} onBack={() => setChatting(null)} />;

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="grid grid-cols-2 gap-2">
        {[{ key: "find", label: "Find a mentor" }, { key: "requests", label: `My requests (${requests.length})` }]
          .map((x) => (
            <button key={x.key} onClick={() => setView(x.key)}
              className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
                view === x.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}>{x.label}</button>
          ))}
      </div>

      <RoadmapCallout />

      {view === "requests" ? (
        <>
          <SectionTitle hint="Status of what you've sent">Your help requests</SectionTitle>
          {requests.length === 0 ? (
            <EmptyState icon={Users} title="No requests yet"
              body="Find a mentor and send a help request letter to get started." />
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{r.mentorName}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-600">
                        {r.subject} · sent {new Date(r.sentAt).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                    <Pill tone={r.status === "accepted" ? "green" : r.status === "declined" ? "red" : "gold"}>
                      {r.status === "pending" ? "Awaiting reply" : r.status}
                    </Pill>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700">{r.goal}</p>
                  {r.status === "accepted" && (
                    <button onClick={() => setChatting(r)}
                      className="mt-3 w-full rounded-lg k-bg-005A36 py-2 text-[11px] font-semibold text-white">
                      Message {r.mentorName}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <SearchBar value={q} onChange={setQ} placeholder="Search a name, subject or institution" />
          <Chips value={role} onChange={setRole}
            options={[{ key: "all", label: "All roles" },
              ...Object.entries(MENTOR_ROLES).map(([k, v]) => ({ key: k, label: v.label }))]} />
          <Chips value={province} onChange={setProvince}
            options={PROVINCES.map((p) => ({ key: p, label: p }))} />
          {mentorsLoading ? (
            <p className="text-xs text-slate-600">Loading mentors…</p>
          ) : (
            <>
              <p className="text-xs text-slate-600">{results.length} verified mentors</p>
              <div className="space-y-3">
                {results.map((m) => (
                  <MentorCard key={m.id} m={m} onRequest={setRequesting} />
                ))}
                {results.length === 0 && (
                  <EmptyState icon={Users} title="No mentors match"
                    body="Widen the role or province filter. The network is growing as partner organisations onboard." />
                )}
              </div>
            </>
          )}
        </>
      )}

      {requesting && (
        <RequestLetterModal mentor={requesting} learner={learner} aps={aps}
          onClose={() => setRequesting(null)}
          onSend={({ mentor, goal, subject, need }) =>
            onCreateRequest({ mentorId: mentor.id, goal, subject, need })} />
      )}
    </div>
  );
}
