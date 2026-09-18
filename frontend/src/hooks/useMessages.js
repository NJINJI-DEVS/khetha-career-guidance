import { useEffect, useState } from 'react';
import { getMessagesForRequest, sendMessage } from '../lib/api';

export function useMessages(helpRequestId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = () => {
    if (!helpRequestId) return;
    setLoading(true);
    getMessagesForRequest(helpRequestId)
      .then((data) => { setMessages(data); setError(null); })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, [helpRequestId]);

  const send = async (body) => {
    await sendMessage(helpRequestId, body);
    refetch();
  };

  return { messages, loading, error, refetch, send };
}
