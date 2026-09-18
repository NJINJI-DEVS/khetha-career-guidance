import { useEffect, useState } from 'react';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api';

// Dashboard/MeScreen read `n.read` (their original, pre-backend field name) — adapt
// the real `isRead` field here rather than touch both consuming components.
const adapt = (n) => ({ ...n, read: n.isRead });

export function useNotifications({ enabled }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    if (!enabled) return;
    setLoading(true);
    getMyNotifications()
      .then((data) => setNotifications(data.map(adapt)))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, [enabled]);

  const markRead = async (id) => {
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
    await markNotificationRead(id).catch(() => refetch());
  };

  const markAllRead = async () => {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    await markAllNotificationsRead().catch(() => refetch());
  };

  return { notifications, loading, refetch, markRead, markAllRead };
}
