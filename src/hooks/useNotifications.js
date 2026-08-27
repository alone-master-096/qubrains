import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { subscribeToNotifications } from "../services/notifications";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const unsubscribe = subscribeToNotifications(user.uid, (list) => {
      setNotifications(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading };
}
