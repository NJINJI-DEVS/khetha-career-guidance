import { useEffect, useState } from 'react';
import { getAdminAnalytics } from '../lib/api';

export function useAdminAnalytics({ enabled }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    getAdminAnalytics()
      .then((d) => { setData(d); setError(null); })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [enabled]);

  return { data, loading, error };
}
