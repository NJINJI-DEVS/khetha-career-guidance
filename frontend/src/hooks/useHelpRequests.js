import { useEffect, useState } from 'react';
import { getMyHelpRequests, createHelpRequest, respondToHelpRequest, issueRecommendationLetter } from '../lib/api';

export function useHelpRequests({ enabled }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = () => {
    if (!enabled) return;
    setLoading(true);
    getMyHelpRequests()
      .then((data) => { setRequests(data); setError(null); })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, [enabled]);

  const create = async (request) => {
    await createHelpRequest(request);
    refetch();
  };

  const respond = async (id, accept) => {
    await respondToHelpRequest(id, accept);
    refetch();
  };

  const issueLetter = async (id, strength, body) => {
    await issueRecommendationLetter(id, strength, body);
    refetch();
  };

  return { requests, loading, error, refetch, create, respond, issueLetter };
}
