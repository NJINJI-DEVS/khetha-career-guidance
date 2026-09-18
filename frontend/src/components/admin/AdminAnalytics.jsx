// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { useState } from 'react';
import { MessageSquare, WifiOff, Target } from 'lucide-react';
import { THEME } from '../../theme/tokens';
import { TELEMETRY } from '../../data/telemetry';
import { fmt, pct } from '../../engines/format';
import { StatCard } from '../ui/StatCard';
import { BarRow } from '../ui/BarRow';
import { Donut } from '../ui/Donut';
import { Panel } from '../ui/Panel';

/* ==================================================================
   Admin: platform data analytics and telemetry
   Figures below are seeded telemetry for the demonstration. In
   production every one is a query against the analytics warehouse.
   ================================================================== */

export function AdminAnalytics({ liveAps }) {
  const t = TELEMETRY;
  const maxProv = Math.max(...t.provinces.map((p) => p.users));
  const maxViews = Math.max(...t.topCareers.map((c) => c.views));
  const [careerSort, setCareerSort] = useState("views");

  const careers = [...t.topCareers].sort((a, b) =>
    careerSort === "views" ? b.views - a.views : b.salary - a.salary
  );
  const gradeTotal = t.gradeSplit.trackA + t.gradeSplit.trackB;
  const maxBand = Math.max(...t.apsDistribution.map((b) => b.n));

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">Platform telemetry · last 30 days</p>
        <p className="mt-0.5 text-lg font-semibold">Khetha NCAP mobile</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Registered</p>
            <p className="text-lg font-bold tabular-nums">{fmt(t.users)}</p>
          </div>
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Active this week</p>
            <p className="text-lg font-bold tabular-nums">{fmt(t.activeThisWeek)}</p>
          </div>
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Mean APS</p>
            <p className="text-lg font-bold tabular-nums">{t.avgAPS}</p>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Grade breakdown" hint="Track A vs Track B">
          <Donut centreLabel="Track B" centreValue={pct(t.gradeSplit.trackB / gradeTotal)}
            segments={[
              { label: "Grade 10–12 (Track B)", n: t.gradeSplit.trackB, color: THEME.primary },
              { label: "Grade 9 (Track A)", n: t.gradeSplit.trackA, color: THEME.gold },
            ]} />
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            Grade 9 uptake is the number that matters most. Subject choice is where a pathway is actually decided, and
            it is the group hardest to reach.
          </p>
        </Panel>

        <Panel title="Provincial reach" hint="Registered users">
          <div className="space-y-2">
            {t.provinces.map((p) => (
              <BarRow key={p.name} label={p.name} value={p.users} max={maxProv} display={fmt(p.users)}
                color={p.users > 6000 ? THEME.primary : THEME.blue} />
            ))}
          </div>
        </Panel>
      </div>

      {/* Offline and low data */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="SMS summaries generated" value={fmt(t.smsGenerated)}
          sub="Learners choosing plain text over data" color={THEME.gold} icon={MessageSquare} />
        <StatCard label="Offline mode activations" value={fmt(t.offlineToggles)}
          sub={`${pct(t.offlineShare)} of sessions use cached content`} color={THEME.blue} icon={WifiOff} />
        <StatCard label="Scarce skills alignment" value={pct(t.scarceSkillsAlignment)}
          sub="Queries matching the DHET critical skills list" color={THEME.primary} icon={Target} />
      </div>

      {/* Reality check */}
      <Panel title="Aspiration versus eligibility" hint="The reality-check metric" wide>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-3xl font-bold tabular-nums k-tx-B3261E">{pct(t.disconnectRate)}</p>
          <p className="text-xs leading-relaxed text-slate-600">
            of learners bookmarking a high-paying career currently fall short of its APS threshold.
          </p>
        </div>
        <div className="mt-4 space-y-2.5">
          {t.disconnectDetail.map((d) => (
            <BarRow key={d.career} label={`${d.career} · ${fmt(d.bookmarks)} bookmarks`}
              value={d.shortfall} max={1} display={pct(d.shortfall)}
              color={d.shortfall > 0.6 ? THEME.red : d.shortfall > 0.3 ? THEME.gold : THEME.primary} />
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
          Read this as a guidance gap, not a failure of ambition. Electrician sits at 9% because the pathway is honest
          about its entry requirements from Grade 9 onward. Medicine sits at 81% because nobody told those learners in
          time what the gate actually was.
        </p>
      </Panel>

      {/* Gateway bottleneck */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Gateway subject bottleneck" hint="What blocks course unlocks">
          <div className="space-y-2.5">
            <BarRow label="Blocked by Pure Maths requirement" value={t.gateway.blockedByPureMaths} max={1}
              display={pct(t.gateway.blockedByPureMaths)} color={THEME.red} />
            <BarRow label="Capped by Maths Literacy ceiling" value={t.gateway.mathsLitCeiling} max={1}
              display={pct(t.gateway.mathsLitCeiling)} color={THEME.gold} />
            <BarRow label="Meets both gateway routes" value={t.gateway.metBoth} max={1}
              display={pct(t.gateway.metBoth)} color={THEME.primary} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            A single Grade 9 decision accounts for most blocked applications on the platform. This is the strongest
            argument for pushing the Subject Chooser earlier, into Grade 8.
          </p>
        </Panel>

        <Panel title="APS distribution" hint={`Mean ${t.avgAPS} · your session ${liveAps}`}>
          <div className="space-y-2.5">
            {t.apsDistribution.map((b) => (
              <BarRow key={b.band} label={`APS ${b.band}`} value={b.n} max={maxBand} display={fmt(b.n)}
                color={THEME.blue} />
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            Most learners land between 20 and 29 — above TVET and UoT entry, below most degree programmes. That band
            is where course matching earns its keep.
          </p>
        </Panel>
      </div>

      {/* Careers */}
      <Panel title="Most viewed occupations" wide
        hint={
          <span className="flex gap-1.5">
            {[["views", "By views"], ["salary", "By salary"]].map(([k, l]) => (
              <button key={k} onClick={() => setCareerSort(k)}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  careerSort === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}>{l}</button>
            ))}
          </span>
        }>
        <div className="space-y-2.5">
          {careers.map((c) => (
            <BarRow key={c.title}
              label={`${c.title} · R${fmt(c.salary)} starting`}
              value={careerSort === "views" ? c.views : c.salary}
              max={careerSort === "views" ? maxViews : 35000}
              display={careerSort === "views" ? fmt(c.views) : `R${fmt(c.salary)}`}
              color={c.salary >= 25000 ? THEME.navy : c.salary >= 15000 ? THEME.blue : THEME.primary} />
          ))}
        </div>
      </Panel>

      {/* Mentor operations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Mentor operations" hint="Request volume and outcome">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { l: "Requests sent", v: fmt(t.mentorOps.sent) },
              { l: "Accepted", v: fmt(t.mentorOps.accepted) },
              { l: "Acceptance rate", v: pct(t.mentorOps.accepted / t.mentorOps.sent) },
              { l: "Letters issued", v: fmt(t.mentorOps.lettersIssued) },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-bold tabular-nums text-slate-900">{s.v}</p>
                <p className="text-[10px] leading-tight text-slate-600">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <BarRow label="Accepted" value={t.mentorOps.accepted} max={t.mentorOps.sent}
              display={fmt(t.mentorOps.accepted)} color={THEME.primary} />
            <BarRow label="Declined" value={t.mentorOps.declined} max={t.mentorOps.sent}
              display={fmt(t.mentorOps.declined)} color={THEME.red} />
            <BarRow label="Still pending" value={t.mentorOps.pending} max={t.mentorOps.sent}
              display={fmt(t.mentorOps.pending)} color={THEME.gold} />
          </div>
        </Panel>

        <Panel title="How mentors were verified" hint={`${fmt(t.verificationMix.reduce((a, m) => a + m.n, 0))} accounts`}>
          <Donut centreLabel="verified" centreValue={fmt(t.verificationMix.reduce((a, m) => a + m.n, 0))}
            segments={t.verificationMix} />
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            Partner NGO codes carry most of the load, which is the intended design: those organisations already run
            vetting we would otherwise have to build.
          </p>
        </Panel>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-slate-600">
        Figures on this dashboard are seeded telemetry for demonstration. In production each panel is a query against
        the analytics warehouse, aggregated and with no personally identifying data.
      </p>
    </div>
  );
}
