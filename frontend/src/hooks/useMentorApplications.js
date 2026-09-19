import { useCallback, useEffect, useRef, useState } from 'react';
import {
  submitMentorApplication, getMyMentorApplications, getAllMentorApplications,
  approveMentorApplication, rejectMentorApplication,
} from '../lib/api';

// `scope: "admin"` lists EVERY application, decided or not (AdminOnly on the
// backend); `scope: "mine"` lists the caller's own submitted applications.
//
// Admin scope used to fetch only pending, which is why approving an application
// made it disappear instead of moving to the Approved tab — that tab, and
// Rejected, could never show anything at all.
export function useMentorApplications({ enabled, scope }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generation = useRef(0);
  const hasLoaded = useRef(false);
  const refetch = useCallback(async () => {
    if (!enabled) return;
    const current = ++generation.current;
    const fetcher = scope === 'admin' ? getAllMentorApplications : getMyMentorApplications;
    try {
      const data = await fetcher();
      if (current === generation.current) { setApplications(data); setError(null); }
    } catch (err) {
      if (current === generation.current) setError(err);
    } finally {
      if (current === generation.current) { hasLoaded.current = true; setLoading(false); }
    }
  }, [enabled, scope]);

  useEffect(() => {
    setApplications([]); setError(null); setLoading(enabled);
    if (!enabled) return;
    refetch();
    const refresh = () => { if (document.visibilityState === 'visible') refetch(); };
    const timer = setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => { ++generation.current; hasLoaded.current = false; clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [enabled, refetch]);

  const submit = async (application, idDocument, transcript) => {
    await submitMentorApplication(application, idDocument, transcript);
    await refetch();
  };

  const approve = async (id) => {
    await approveMentorApplication(id);
    await refetch();
  };

  const reject = async (id) => {
    await rejectMentorApplication(id);
    await refetch();
  };

  return { applications: enabled && hasLoaded.current ? applications : [], loading: enabled && (loading || !hasLoaded.current), error, refetch, submit, approve, reject };
}
