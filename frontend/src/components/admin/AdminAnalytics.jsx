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
import { Users, UserCheck, UserX, Mail } from 'lucide-react';

export function AdminAnalytics() {
  const { data, loading, error } = useAdminAnalytics({ enabled: true });

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
