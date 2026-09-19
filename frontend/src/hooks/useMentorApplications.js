import { useEffect, useState } from 'react';
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

  const refetch = () => {
    if (!enabled) return;
    setLoading(true);
    const fetcher = scope === 'admin' ? getAllMentorApplications : getMyMentorApplications;
    fetcher()
      .then((data) => { setApplications(data); setError(null); })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, [enabled, scope]);

  const submit = async (application) => {
    await submitMentorApplication(application);
    refetch();
  };

  const approve = async (id) => {
    await approveMentorApplication(id);
    refetch();
  };

  const reject = async (id) => {
    await rejectMentorApplication(id);
    refetch();
  };

  return { applications, loading, error, refetch, submit, approve, reject };
}
