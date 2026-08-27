import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, query, orderByChild, equalTo, onValue } from "firebase/database";
import { db } from "../../firebase/database";
import { useAuth } from "../../hooks/useAuth";
import { useProfiles } from "../../hooks/useProfiles";
import { ensureConversation } from "../../services/chats";
import Avatar from "../common/Avatar";

export default function OnlineUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlineUids, setOnlineUids] = useState([]);

  useEffect(() => {
    const onlineQuery = query(ref(db, "presence"), orderByChild("online"), equalTo(true));
    const unsubscribe = onValue(onlineQuery, (snapshot) => {
      const data = snapshot.val() || {};
      setOnlineUids(Object.keys(data).filter((uid) => uid !== user?.uid));
    });
    return () => unsubscribe();
  }, [user]);

  const profiles = useProfiles(onlineUids);
  const onlineUsers = onlineUids.map((uid) => profiles[uid]).filter(Boolean);

  async function handleOpenChat(otherUid) {
    if (!user) return;
    try {
      const conversationId = await ensureConversation(user.uid, otherUid);
      navigate(`/chats/${conversationId}`);
    } catch {
      // Rare (requires a mid-request permission/network failure) — the
      // user can just tap again, so this isn't worth a persistent error
      // banner on what's otherwise a lightweight list.
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-100 p-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-pulse" />
        <h2 className="text-sm font-semibold text-ink">{onlineUids.length} online</h2>
      </div>

      {onlineUids.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">Nobody else is online right now.</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {onlineUsers.map((u) => (
            <li key={u.uid}>
              <button
                onClick={() => handleOpenChat(u.uid)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-zinc-50"
              >
                <Avatar name={u.displayName} src={u.profilePic} size={36} online />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{u.displayName}</p>
                  {u.username && <p className="truncate text-xs text-zinc-400">@{u.username}</p>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
