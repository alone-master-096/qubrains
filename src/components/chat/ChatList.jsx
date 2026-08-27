import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useChats } from "../../hooks/useChats";
import { useProfiles } from "../../hooks/useProfiles";
import Avatar from "../common/Avatar";
import Loader from "../common/Loader";
import { formatMessageListTime } from "../../utils/formatTime";

export default function ChatList() {
  const navigate = useNavigate();
  const { conversations, loading } = useChats();
  const [search, setSearch] = useState("");

  const otherUids = useMemo(() => conversations.map((c) => c.otherUid), [conversations]);
  const profiles = useProfiles(otherUids);

  const filtered = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const p = profiles[c.otherUid];
    return p?.displayName?.toLowerCase().includes(q) || p?.username?.toLowerCase().includes(q);
  });

  if (loading) return <Loader fullScreen label="Loading chats…" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-xl font-semibold text-ink">Chats</h1>

      <div className="relative mt-4">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
          className="w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
      </div>

      {conversations.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-400">
          No conversations yet — say hi to someone from the online users list.
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-400">No chats match "{search}".</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-50">
          {filtered.map((conversation) => {
            const otherUser = profiles[conversation.otherUid];
            const name = otherUser?.displayName || "…";
            return (
              <li key={conversation.id}>
                <button
                  onClick={() => navigate(`/chats/${conversation.id}`)}
                  className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-zinc-50"
                >
                  <Avatar name={name} src={otherUser?.profilePic} size={44} online={otherUser?.online} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink">{name}</p>
                      {conversation.lastMessageTime && (
                        <span className="shrink-0 text-xs text-zinc-400">
                          {formatMessageListTime(conversation.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-zinc-500">{conversation.lastMessage || "Say hi 👋"}</p>
                      {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-signal px-1.5 text-[11px] font-semibold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
