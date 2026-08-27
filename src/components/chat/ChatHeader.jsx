import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Clock, UserCheck, X } from "lucide-react";
import Avatar from "../common/Avatar";
import { formatLastSeen } from "../../utils/formatTime";
import { useAuth } from "../../hooks/useAuth";
import { subscribeToConnectionStatus, sendConnectionRequest, cancelConnectionRequest } from "../../services/requests";

export default function ChatHeader({ otherUser }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState("none");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || !otherUser?.uid) return;
    return subscribeToConnectionStatus(user.uid, otherUser.uid, setConnectionStatus);
  }, [user, otherUser?.uid]);

  async function handleConnect() {
    if (!user || !otherUser) return;
    setSending(true);
    try {
      await sendConnectionRequest(user.uid, otherUser.uid, profile?.displayName || "Someone");
    } catch {
      // The live status subscription reflects the true state regardless —
      // nothing further to do here on failure.
    } finally {
      setSending(false);
    }
  }

  async function handleCancel() {
    if (!user || !otherUser) return;
    setSending(true);
    try {
      await cancelConnectionRequest(user.uid, otherUser.uid);
    } catch {
      // Same as above — the subscription is the source of truth.
    } finally {
      setSending(false);
    }
  }

  const statusText = otherUser?.online
    ? "Online"
    : otherUser?.lastSeen
      ? `Last seen ${formatLastSeen(otherUser.lastSeen)}`
      : "";

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-zinc-100 px-4 py-3">
      <button
        onClick={() => navigate("/chats")}
        aria-label="Back to chats"
        className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-ink"
      >
        <ArrowLeft size={20} />
      </button>

      {otherUser && (
        <>
          <Avatar name={otherUser.displayName} src={otherUser.profilePic} size={38} online={otherUser.online} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{otherUser.displayName}</p>
            {statusText && <p className="truncate text-xs text-zinc-400">{statusText}</p>}
          </div>

          {connectionStatus === "none" && (
            <button
              onClick={handleConnect}
              disabled={sending}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-zinc-50 disabled:opacity-60"
            >
              <UserPlus size={13} /> Connect
            </button>
          )}
          {connectionStatus === "outgoing" && (
            <button
              onClick={handleCancel}
              disabled={sending}
              aria-label="Cancel connection request"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 py-1.5 pl-3 pr-2 text-xs font-medium text-zinc-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-60"
            >
              <Clock size={13} />
              Pending
              <X size={13} className="ml-0.5" />
            </button>
          )}
          {connectionStatus === "connected" && (
            <span className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-signal">
              <UserCheck size={13} /> Connected
            </span>
          )}
        </>
      )}
    </div>
  );
}
