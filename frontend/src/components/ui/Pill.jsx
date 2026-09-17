// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
export function Pill({ children, tone = "slate", icon: Icon, style }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    green: "k-bg-E7F4EE k-tx-005A36 k-rg-A8DCC5",
    gold: "k-bg-FBF5E7 k-tx-6B5307 k-rg-E4CE8A",
    navy: "bg-slate-900 text-white ring-slate-900",
    red: "k-bg-FBEAE8 k-tx-9B1C14 k-rg-F2CBC7",
    blue: "k-bg-EAEFF7 k-tx-1E3A6E k-rg-C3CFE4",
  };
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${tones[tone]}`}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}
