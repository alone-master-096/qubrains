import { CheckCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { markAllNotificationsRead } from "../../services/notifications";
import Loader from "../common/Loader";
import NotificationItem from "./NotificationItem";

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading } = useNotifications();

  if (loading) return <Loader fullScreen label="Loading notifications…" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead(user.uid, notifications)}
            className="flex items-center gap-1.5 text-xs font-medium text-signal"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-400">You're all caught up.</p>
      ) : (
        <div className="mt-4 space-y-1">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
