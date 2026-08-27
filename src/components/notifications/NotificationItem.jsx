import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, UserPlus, Info, X, Check } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase/database";
import { useAuth } from "../../hooks/useAuth";
import { markNotificationRead, deleteNotification } from "../../services/notifications";
import { acceptConnectionRequest, rejectConnectionRequest } from "../../services/requests";
import { formatLastSeen } from "../../utils/formatTime";

const ICONS = { message: MessageCircle, request: UserPlus, system: Info };

export default function NotificationItem({ notification }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const Icon = ICONS[notification.type] || Info;

  const [requestStatus, setRequestStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const isRequestNotification = notification.type === "request" && notification.relatedId;

  useEffect(() => {
    if (!isRequestNotification || !user) return;
    const unsubscribe = onValue(ref(db, `requests/${user.uid}/${notification.relatedId}`), (snap) => {
      setRequestStatus(snap.exists() ? snap.val().status : null);
    });
    return () => unsubscribe();
  }, [isRequestNotification, user, notification.relatedId]);

  function handleOpen() {
    if (!notification.read) markNotificationRead(user.uid, notification.id);
    if (notification.type === "message" && notification.relatedId) {
      navigate(`/chats/${notification.relatedId}`);
    }
  }

  async function handleAccept(e) {
    e.stopPropagation();
    setBusy(true);
    setActionError("");
    try {
      await acceptConnectionRequest(user.uid, notification.relatedId, profile?.displayName || "Someone");
      await markNotificationRead(user.uid, notification.id);
    } catch {
      setActionError("Couldn't accept. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(e) {
    e.stopPropagation();
    setBusy(true);
    setActionError("");
    try {
      await rejectConnectionRequest(user.uid, notification.relatedId);
      await markNotificationRead(user.uid, notification.id);
    } catch {
      setActionError("Couldn't decline. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleDelete(e) {
    e.stopPropagation();
    deleteNotification(user.uid, notification.id);
  }

  return (
    <div
      onClick={handleOpen}
      className={`flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-zinc-50 ${
        notification.read ? "" : "bg-signal/5"
      } ${notification.type === "message" ? "cursor-pointer" : ""}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">{notification.text}</p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {notification.createdAt ? formatLastSeen(notification.createdAt) : ""}
        </p>

        {isRequestNotification && requestStatus === "pending" && (
          <div className="mt-2">
            {actionError && <p className="mb-1.5 text-xs text-red-600">{actionError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                disabled={busy}
                className="flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-60"
              >
                <Check size={13} /> Accept
              </button>
              <button
                onClick={handleReject}
                disabled={busy}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 disabled:opacity-60"
              >
                Decline
              </button>
            </div>
          </div>
        )}
      </div>

      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-signal" />}

      <button
        onClick={handleDelete}
        aria-label="Delete notification"
        className="shrink-0 rounded-full p-1 text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500"
      >
        <X size={14} />
      </button>
    </div>
  );
}
