// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { Heart } from 'lucide-react';

export function FavouriteButton({ on, onToggle, label }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? `Remove ${label} from saved` : `Save ${label}`}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 transition-colors ${
        on ? "k-bg-FBEAE8 k-tx-B3261E k-rg-F2CBC7" : "bg-white text-slate-500 ring-slate-200"
      }`}
    >
      <Heart className={`h-4 w-4 ${on ? "fill-current" : ""}`} />
    </button>
  );
}
