// Theme control: System / Light / Dark.
//
// Three options rather than a switch, because "follow my phone" is a real and
// common preference — Android drops the whole device to dark when battery
// saver turns on — and a two-state switch cannot express it.

import { Sun, Moon, SunMoon } from 'lucide-react';

const OPTIONS = [
  { key: 'system', label: 'System', icon: SunMoon, note: 'Follows your phone or computer' },
  { key: 'light', label: 'Light', icon: Sun, note: 'Always light, whatever the device does' },
  { key: 'dark', label: 'Dark', icon: Moon, note: 'Always dark, easier at night and on battery' },
];

/** Full three-way control, for a settings page. */
export function ThemeToggle({ mode, setMode }) {
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-2">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = mode === o.key;
        return (
          <button key={o.key} role="radio" aria-checked={active} onClick={() => setMode(o.key)}
            title={o.note}
            className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-[11px] font-medium transition-colors ${
              active ? 'k-bg-005A36 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
            <Icon className="h-4 w-4" />{o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Single icon button that cycles the three modes, for the app header. */
export function ThemeCycleButton({ mode, theme, cycle }) {
  const Icon = mode === 'system' ? SunMoon : mode === 'dark' ? Moon : Sun;
  const label = mode === 'system'
    ? `Appearance: following your device (${theme}). Tap to choose light.`
    : `Appearance: ${mode}. Tap to change.`;
  return (
    <button onClick={cycle} aria-label={label} title={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
      <Icon className="h-4 w-4" />
    </button>
  );
}
