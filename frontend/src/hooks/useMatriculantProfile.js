// The one real source of truth for the signed-in learner's profile and subjects —
// replaces both the old DEMO_PROFILES-driven `learner` and App.jsx's separate
// `subjects` root state, which had silently drifted into two independent copies
// of the same concept (editing the APS calculator never updated what
// OfflineCentre/SmsSummaryModal/RequestLetterModal showed via `learner.subjects`).
import { useEffect, useState } from 'react';
import { getMyMatriculantProfile, createMatriculantProfile, updateMySubjects } from '../lib/api';
import { matriculantToLearner, keyForSubject, subjectToDisplay } from '../adapters/learner';

function subjectsFromMatriculant(matriculant) {
  const subjects = (matriculant.subjects || []).map(subjectToDisplay);
  const mathsRow = (matriculant.subjects || []).find((s) => keyForSubject(s.subjectName) === "maths");
  const mathsIsPure = mathsRow ? !/literacy/i.test(mathsRow.subjectName) : true;
  return { subjects, mathsIsPure };
}

export function useMatriculantProfile({ enabled }) {
  const [status, setStatus] = useState('loading'); // loading | no-profile | ready | error
  const [error, setError] = useState(null);
  const [matriculant, setMatriculant] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [mathsIsPure, setMathsIsPure] = useState(true);
  const [retryTick, setRetryTick] = useState(0);
  const refetch = () => setRetryTick((t) => t + 1);

  useEffect(() => {
    if (!enabled) { setStatus('loading'); return; }
    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const profile = await getMyMatriculantProfile();
        if (cancelled) return;
        setMatriculant(profile);
        const derived = subjectsFromMatriculant(profile);
        setSubjects(derived.subjects);
        setMathsIsPure(derived.mathsIsPure);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        if (/API error 404/.test(err.message)) setStatus('no-profile');
        else { setError(err); setStatus('error'); }
      }
    })();

    return () => { cancelled = true; };
  }, [enabled, retryTick]);

  // Debounced persistence: the APS calculator's sliders update `subjects` on every
  // drag tick — saving on every tick would be excessive, so this waits for a pause.
  useEffect(() => {
    if (status !== 'ready' || !matriculant) return undefined;
    const timer = setTimeout(() => {
      const payload = subjects.map((s) => ({
        subjectName: s.key === 'maths' ? (mathsIsPure ? 'Mathematics' : 'Mathematical Literacy') : s.label,
        percentage: s.pct,
        isHomeLanguage: false,
      }));
      updateMySubjects(payload).catch((err) => console.error('Failed to save subjects', err));
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, mathsIsPure]);

  const createProfile = async (input) => {
    const profile = await createMatriculantProfile(input);
    setMatriculant(profile);
    const derived = subjectsFromMatriculant(profile);
    setSubjects(derived.subjects);
    setMathsIsPure(derived.mathsIsPure);
    setStatus('ready');
  };

  return {
    status,
    profileError: error,
    hasProfile: status === 'ready',
    learner: matriculantToLearner(matriculant),
    subjects,
    setSubjects,
    mathsIsPure,
    setMathsIsPure,
    createProfile,
    refetch,
  };
}
