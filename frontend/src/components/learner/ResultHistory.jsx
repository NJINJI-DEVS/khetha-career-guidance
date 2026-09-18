import { TrendingUp, ChevronRight } from 'lucide-react';
import { fmtWhen } from '../../engines/history';

export function ResultHistory({ history, kind, current }) {
  const list = (history?.[kind] || []).filter((h) => h.summary);
  if (list.length < 1) return null;

  const previous = list[list.length - 1];
  const changed = previous.summary !== current;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <TrendingUp className="h-4 w-4" />How this compares
      </p>
      <div className="mt-2.5 flex items-center gap-3">
        <div className="flex-1 rounded-xl bg-slate-50 p-2.5">
          <p className="text-[10px] text-slate-600">{fmtWhen(previous.at)}</p>
          <p className="text-xs font-semibold text-slate-900">{previous.summary}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        <div className="flex-1 rounded-xl k-bg-E7F4EE p-2.5">
          <p className="text-[10px] k-tx-005A36">Today</p>
          <p className="text-xs font-semibold k-tx-005A36">{current}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
        {changed
          ? "Your result moved. That is normal — interests settle as you get older, and the earlier answer is not wrong."
          : "The same result as last time. A repeated answer is a strong signal; take it seriously."}
      </p>
      {list.length > 1 && (
        <p className="mt-1.5 text-[10px] text-slate-600">
          {list.length} previous attempts on record, from {fmtWhen(list[0].at)}.
        </p>
      )}
    </div>
  );
}
