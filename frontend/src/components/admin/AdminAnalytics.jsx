// Wired to the real backend (GET /api/admin/analytics, via useAdminAnalytics).
// The mock's TELEMETRY had panels for things nothing on this platform actually
// tracks — active-this-week, SMS-generated count, offline-toggle rate, career
// page views, the aspiration/eligibility "disconnect rate", gateway-subject
// bottlenecks. None of those have a backing table (no session/event tracking
// exists), so rather than backfill them with fake numbers, those panels are
// gone. What's left is smaller, but every figure on it is real.
import { THEME } from '../../theme/tokens';
import { fmt } from '../../engines/format';
import { useAdminAnalytics } from '../../hooks/useAdminAnalytics';
import { StatCard } from '../ui/StatCard';
import { BarRow } from '../ui/BarRow';
import { Donut } from '../ui/Donut';
import { Panel } from '../ui/Panel';
import { Users, UserCheck, UserX, Mail, Clock } from 'lucide-react';

// `injected` lets demo administrator mode render this from local data. When it
// is absent the component fetches from the real AdminOnly endpoint exactly as
// before, so the signed-in path is unchanged.
export function AdminAnalytics({ data: injected }) {
  const fetched = useAdminAnalytics({ enabled: !injected });
  const data = injected || fetched.data;
  const loading = !injected && fetched.loading;
  const error = !injected && fetched.error;

  if (loading) return <p className="p-4 text-xs text-slate-600">Loading analytics…</p>;
  if (error || !data) return <p className="p-4 text-xs text-slate-600">Couldn't load analytics right now.</p>;

  const maxProv = Math.max(1, ...data.matriculantsByProvince.map((p) => p.count));
  const helpTotal = data.pendingHelpRequests + data.acceptedHelpRequests + data.declinedHelpRequests;
  const verificationTotal = data.verificationMix.reduce((a, m) => a + m.count, 0);

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="rounded-2xl k-grad-green p-4 text-white">
        <p className="text-xs k-tx-BFE5D4">Platform data · live</p>
        <p className="mt-0.5 text-lg font-semibold">Khetha NCAP mobile</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Registered learners</p>
            <p className="text-lg font-bold tabular-nums">{fmt(data.totalMatriculants)}</p>
          </div>
          <div className="rounded-xl k-bg-00432A-60 p-2.5">
            <p className="text-[10px] k-tx-BFE5D4">Mean APS</p>
            <p className="text-lg font-bold tabular-nums">
              {data.averageAps != null ? data.averageAps.toFixed(1) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Who is actually on the platform, by the role their account is bound to */}
      {data.roles && (
        <Panel title="Who is on the platform" hint={`${fmt(data.roles.total)} accounts`}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { l: "Learners", v: data.roles.students, c: THEME.primary },
              { l: "Mentors", v: data.roles.mentors, c: THEME.blue },
              { l: "Professionals", v: data.roles.professionals, c: THEME.gold },
              { l: "Administrators", v: data.roles.admins, c: THEME.navy },
            ].map((r) => (
              <div key={r.l} className="rounded-xl border border-slate-200 p-2.5 text-center">
                <p className="text-lg font-bold tabular-nums" style={{ color: r.c }}>{fmt(r.v)}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{r.l}</p>
              </div>
            ))}
          </div>
          {data.roles.unassigned > 0 && (
            <p className="mt-2.5 text-[11px] leading-relaxed text-slate-600">
              {fmt(data.roles.unassigned)} learner {data.roles.unassigned === 1 ? "profile has" : "profiles have"} no
              role bound yet — they created a profile without completing role registration.
            </p>
          )}
        </Panel>
      )}

      {/* Growth */}
      {data.growth && (
        <Panel title="New learners" hint="Last 30 days">
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Past 7 days", v: fmt(data.growth.newLast7Days) },
              { l: "Past 30 days", v: fmt(data.growth.newLast30Days) },
              { l: "Average a day", v: data.growth.averagePerDayLast30 },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-slate-200 p-2.5 text-center">
                <p className="text-lg font-bold tabular-nums text-slate-900">{s.v}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{s.l}</p>
              </div>
            ))}
          </div>
          {data.growth.dailySignups?.length > 0 ? (
            <div className="mt-3">
              <div className="flex h-16 items-end gap-0.5">
                {data.growth.dailySignups.map((d) => {
                  const max = Math.max(...data.growth.dailySignups.map((x) => x.count), 1);
                  return (
                    <div key={d.day} title={`${d.day}: ${d.count}`}
                      className="flex-1 rounded-t"
                      style={{ height: `${Math.max(6, (d.count / max) * 100)}%`, background: THEME.primary }} />
                  );
                })}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-600">
                {data.growth.dailySignups[0].day} to {data.growth.dailySignups.at(-1).day}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-600">No signups in the last 30 days.</p>
          )}
        </Panel>
      )}

      {/* Mentor pipeline — the queue an administrator is responsible for */}
      {data.pipeline && (
        <Panel title="Mentor and event queue" hint="Waiting on an administrator">
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Applications", v: data.pipeline.pending, tone: data.pipeline.pending > 0 ? THEME.gold : THEME.primary },
              { l: "Events", v: data.pipeline.pendingEvents, tone: data.pipeline.pendingEvents > 0 ? THEME.gold : THEME.primary },
              { l: "Active mentors", v: data.pipeline.activeMentors, tone: THEME.primary },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-slate-200 p-2.5 text-center">
                <p className="text-lg font-bold tabular-nums" style={{ color: s.tone }}>{fmt(s.v)}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 text-[11px]">
            {data.pipeline.oldestPendingDays != null && (
              <p className={`flex items-center gap-1.5 ${data.pipeline.oldestPendingDays > 7 ? "k-tx-9B1C14" : "text-slate-700"}`}>
                <Clock className="h-3.5 w-3.5 shrink-0" />
                Oldest application has waited <span className="font-semibold">{data.pipeline.oldestPendingDays} days</span>
                {data.pipeline.oldestPendingDays > 7 && " — a learner is not being reached while it sits."}
              </p>
            )}
            {data.pipeline.medianDaysToDecision != null && (
              <p className="text-slate-600">
                Median time to a decision: {data.pipeline.medianDaysToDecision} days
              </p>
            )}
            <p className="text-slate-600">{fmt(data.pipeline.upcomingEvents)} approved events still ahead</p>
          </div>
        </Panel>
      )}

      {/* Reach — what learners actually sign up on */}
      {(data.deviceMix?.length > 0 || data.platformMix?.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Devices learners sign up on" hint="At profile creation">
            <div className="space-y-2">
              {data.deviceMix.map((d) => (
                <BarRow key={d.label} label={d.label === "unknown" ? "Not detected" : d.label}
                  value={d.count} max={Math.max(1, ...data.deviceMix.map((x) => x.count))}
                  display={fmt(d.count)} color={THEME.blue} />
              ))}
            </div>
            <p className="mt-2.5 text-[10px] leading-relaxed text-slate-600">
              Device class and operating system only — the full browser string is never stored. Enough to decide
              where build effort goes, without collecting more than the question needs.
            </p>
          </Panel>

          <Panel title="Operating systems" hint="At profile creation">
            <div className="space-y-2">
              {data.platformMix.map((d) => (
                <BarRow key={d.label} label={d.label === "unknown" ? "Not detected" : d.label}
                  value={d.count} max={Math.max(1, ...data.platformMix.map((x) => x.count))}
                  display={fmt(d.count)} color={THEME.gold} />
              ))}
            </div>
          </Panel>
        </div>
      )}

      <Panel title="Provincial reach" hint="Registered learners">
        {data.matriculantsByProvince.length === 0 ? (
          <p className="text-xs text-slate-600">No learners have registered yet.</p>
        ) : (
          <div className="space-y-2">
            {data.matriculantsByProvince.map((p) => (
              <BarRow key={p.province} label={p.province} value={p.count} max={maxProv} display={fmt(p.count)}
                color={THEME.blue} />
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending applications" value={fmt(data.pendingApplications)}
          sub="Awaiting admin review" color={THEME.gold} icon={Users} />
        <StatCard label="Approved mentors" value={fmt(data.approvedMentors)}
          sub="Live in the mentor directory" color={THEME.primary} icon={UserCheck} />
        <StatCard label="Rejected applications" value={fmt(data.rejectedApplications)}
          sub="Did not pass review" color={THEME.red} icon={UserX} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Help request outcomes" hint={`${fmt(helpTotal)} sent`}>
          {helpTotal === 0 ? (
            <p className="text-xs text-slate-600">No help requests have been sent yet.</p>
          ) : (
            <div className="space-y-2.5">
              <BarRow label="Accepted" value={data.acceptedHelpRequests} max={helpTotal}
                display={fmt(data.acceptedHelpRequests)} color={THEME.primary} />
              <BarRow label="Declined" value={data.declinedHelpRequests} max={helpTotal}
                display={fmt(data.declinedHelpRequests)} color={THEME.red} />
              <BarRow label="Still pending" value={data.pendingHelpRequests} max={helpTotal}
                display={fmt(data.pendingHelpRequests)} color={THEME.gold} />
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3">
            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
            <p className="text-[11px] text-slate-700">
              <span className="font-semibold tabular-nums">{fmt(data.recommendationLettersIssued)}</span> recommendation
              letters issued
            </p>
          </div>
        </Panel>

        <Panel title="How mentors were verified" hint={`${fmt(verificationTotal)} accounts`}>
          {verificationTotal === 0 ? (
            <p className="text-xs text-slate-600">No mentors have been approved yet.</p>
          ) : (
            <Donut centreLabel="verified" centreValue={fmt(verificationTotal)}
              segments={data.verificationMix.map((m, i) => ({
                label: m.method, n: m.count,
                color: [THEME.primary, THEME.gold, THEME.blue, THEME.navy][i % 4],
              }))} />
          )}
        </Panel>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-slate-600">
        Every figure above is computed from real registered accounts and submissions — there's no usage-pattern
        telemetry (page views, session activity) yet, so those aren't shown.
      </p>
    </div>
  );
}
