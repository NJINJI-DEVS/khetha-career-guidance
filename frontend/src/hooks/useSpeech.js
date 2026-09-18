// Checklist A6 / C4 — read-aloud for low digital-literacy users.
//
// Uses the browser's own speech synthesis, so it costs nothing, needs no
// connection once a voice is installed, and works on an entry-level Android
// phone. Where no voice exists for a language the button hides itself rather
// than reading it in the wrong accent.
import { useState, useEffect, useCallback } from 'react';

const SPEECH_LANGS = {
  en: "en-ZA", zu: "zu-ZA", tn: "tn-ZA", af: "af-ZA", xh: "xh-ZA", st: "st-ZA",
};

export function useSpeech(lang) {
  const [speaking, setSpeaking] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setAvailable(false);
      return undefined;
    }
    return () => window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (text) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const synth = window.speechSynthesis;
      if (synth.speaking) {
        synth.cancel();
        setSpeaking(false);
        return;
      }
      const u = new window.SpeechSynthesisUtterance(text);
      const want = SPEECH_LANGS[lang] || "en-ZA";
      const voices = synth.getVoices() || [];
      /* Prefer an exact South African voice, then the same language in any
         region, then whatever the device defaults to. */
      const voice =
        voices.find((v) => v.lang === want) ||
        voices.find((v) => v.lang?.startsWith(want.split("-")[0])) ||
        null;
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : want;
      u.rate = 0.92;              /* slightly slow: this is for comprehension */
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(u);
    },
    [lang]
  );

  return { speak, speaking, available };
}
