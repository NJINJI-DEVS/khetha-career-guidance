// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { SUBJECT_LABELS } from '../../data/subjects';
import { MENTOR_ROLES, MENTORS } from '../../data/mentors';
import { PROVINCES } from '../explore/ProvidersDirectory';
import { SearchBar } from '../ui/SearchBar';
import { Chips } from '../ui/Chips';
import { SectionTitle } from '../ui/SectionTitle';
import { EmptyState } from '../ui/EmptyState';
import { RoadmapCallout } from '../ui/RoadmapCallout';
import { MentorChat } from './MentorChat';
import { RequestLetterModal } from './RequestLetterModal';
import { MentorCard } from './MentorCard';
import { MentorInbox } from './MentorInbox';

/* ---- Hub ----------------------------------------------------------- */
export function MentorHub({ learner, aps, requests, setRequests }) {
  const [view, setView] = useState("find");
  const [role, setRole] = useState("all");
  const [province, setProvince] = useState("All");
  const [q, setQ] = useState("");
  const [requesting, setRequesting] = useState(null);
  const [chatting, setChatting] = useState(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return MENTORS
      .filter((m) => (role === "all" ? true : m.role === role))
      .filter((m) => (province === "All" ? true : m.province === province))
      .filter((m) => !s || m.name.toLowerCase().includes(s) ||
        m.subjects.join(" ").toLowerCase().includes(s) || m.studying.toLowerCase().includes(s));
  }, [role, province, q]);

  if (chatting) return <MentorChat mentor={chatting} onBack={() => setChatting(null)} />;

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="grid grid-cols-2 gap-2">
        {[{ key: "find", label: "Find a mentor" }, { key: "inbox", label: `Mentor inbox (${requests.filter((r) => r.status === "pending").length})` }]
          .map((x) => (
            <button key={x.key} onClick={() => setView(x.key)}
              className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
                view === x.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}>{x.label}</button>
          ))}
      </div>

      <RoadmapCallout />

      {view === "inbox" ? (
        <>
          <SectionTitle hint="What a mentor sees">Incoming request letters</SectionTitle>
          <MentorInbox requests={requests}
            onAct={(id, status) => setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))} />
        </>
      ) : (
        <>
          <SearchBar value={q} onChange={setQ} placeholder="Search a name, subject or institution" />
          <Chips value={role} onChange={setRole}
            options={[{ key: "all", label: "All roles" },
              ...Object.entries(MENTOR_ROLES).map(([k, v]) => ({ key: k, label: v.label }))]} />
          <Chips value={province} onChange={setProvince}
            options={PROVINCES.map((p) => ({ key: p, label: p }))} />
          <p className="text-xs text-slate-600">{results.length} verified mentors</p>
          <div className="space-y-3">
            {results.map((m) => (
              <MentorCard key={m.id} m={m} onRequest={setRequesting} onOpen={setChatting} />
            ))}
            {results.length === 0 && (
              <EmptyState icon={Users} title="No mentors match"
                body="Widen the role or province filter. The network is growing as partner organisations onboard." />
            )}
          </div>
        </>
      )}

      {requesting && (
        <RequestLetterModal mentor={requesting} learner={learner} aps={aps}
          onClose={() => setRequesting(null)}
          onSend={({ mentor, goal, subject, need }) =>
            setRequests((rs) => [{
              id: `r-${Date.now()}`, from: learner.name, grade: learner.grade, mentorId: mentor.id,
              subject, goal, aps: aps || "—",
              marks: learner.subjects
                ? learner.subjects.filter((s) => !s.excluded).slice(0, 3).map((s) => `${s.label} ${s.pct}%`).join(", ")
                : Object.entries(learner.gr9Marks || {}).slice(0, 3).map(([k, v]) => `${SUBJECT_LABELS[k] || k} ${v}%`).join(", "),
              need, status: "pending", sent: "just now",
            }, ...rs])} />
      )}
    </div>
  );
}
