import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMessages } from "../../hooks/useMessages";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  getConversationParticipants,
  sendTextMessage,
  setTypingStatus,
  subscribeToTyping,
} from "../../services/chats";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const { user, profile } = useAuth();
  const { messages, loading, loadingEarlier, hasMore, loadEarlier } = useMessages(conversationId);

  const [otherUid, setOtherUid] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const otherUser = useUserProfile(otherUid);

  useEffect(() => {
    let cancelled = false;
    setOtherUid(null);
    getConversationParticipants(conversationId).then((uids) => {
      if (!cancelled) setOtherUid(uids.find((uid) => uid !== user?.uid) || null);
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId || !user) return;
    return subscribeToTyping(conversationId, user.uid, setOtherTyping);
  }, [conversationId, user]);

  async function handleSendText(text) {
    if (!user || !otherUid) return;
    const senderName = profile?.displayName || user.email;
    await sendTextMessage({ conversationId, senderId: user.uid, senderName, receiverId: otherUid, text });
  }

  function handleTypingChange(isTyping) {
    if (user) setTypingStatus(conversationId, user.uid, isTyping);
  }

  if (!user) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader otherUser={otherUser} />
      <MessageList
        messages={messages}
        loading={loading}
        myUid={user.uid}
        hasMore={hasMore}
        loadingEarlier={loadingEarlier}
        onLoadEarlier={loadEarlier}
      />
      {otherTyping && (
        <p className="shrink-0 px-4 pb-1 text-xs text-zinc-400">
          {otherUser?.displayName ? `${otherUser.displayName} is typing…` : "Typing…"}
        </p>
      )}
      <MessageInput onSend={handleSendText} onTypingChange={handleTypingChange} />
    </div>
  );
}
