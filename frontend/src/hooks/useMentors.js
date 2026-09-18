import { useEffect, useState } from 'react';
import { listMentors } from '../lib/api';

export function useMentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = () => {
    setLoading(true);
    listMentors()
      .then((data) => { setMentors(data); setError(null); })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, []);

  return { mentors, loading, error, refetch };
}
