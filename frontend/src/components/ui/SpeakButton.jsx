import { Volume2, X } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

export function SpeakButton({ text, lang = "en", label = "Read this aloud", className = "" }) {
  const { speak, speaking, available } = useSpeech(lang);
  if (!available) return null;
  return (
    <button onClick={() => speak(text)} aria-label={speaking ? "Stop reading" : label}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
        speaking ? "k-bg-005A36 text-white" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
      } ${className}`}>
      {speaking ? <X className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}
