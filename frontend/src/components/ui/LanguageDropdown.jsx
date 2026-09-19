// Language chooser as a dropdown, for the top-right of a page header.
//
// The trigger shows a globe and the CURRENT language in its own name —
// "isiZulu", not "Zulu" — because the person who most needs this control is the
// one who cannot read the language the app is currently in. A globe plus a word
// they recognise is legible from across that gap; a label reading "Language"
// only works if you already read English.
//
// The chip row it replaces is still the right shape inside a settings page,
// where there is room and nothing else competes. This is for page chrome.

import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES } from '../../data/i18n';

export function LanguageDropdown({ t, lang, setLang, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // Close on an outside click or Escape. Both are expected of a menu, and
  // without them a phone user has no way to dismiss it without choosing.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (code) => {
    setLang(code);
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('chooseLanguage')}
        className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pl-2.5 pr-2 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200 transition-colors hover:bg-slate-200"
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-slate-600" />
        <span lang={current.code}>{current.native}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('chooseLanguage')}
          className={`absolute top-full z-40 mt-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  lang={l.code}
                  onClick={() => choose(l.code)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                    active ? 'k-tx-005A36 font-semibold' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Check className={`h-3.5 w-3.5 shrink-0 ${active ? '' : 'opacity-0'}`} />
                  {l.native}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
