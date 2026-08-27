import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { subscribeToRecentMessages, fetchEarlierMessages, markConversationRead } from "../services/chats";

const PAGE_SIZE = 30;

export function useMessages(conversationId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Older pages loaded via loadEarlier() — kept separately so the live
  // subscription's callback (which only knows about its own recent
  // window) can be merged back in front of them on every update.
  const earlierRef = useRef([]);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    setHasMore(true);
    earlierRef.current = [];

    const unsubscribe = subscribeToRecentMessages(conversationId, (recent) => {
      setMessages([...earlierRef.current, ...recent]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const loadEarlier = useCallback(async () => {
    if (!conversationId || loadingEarlier || !hasMore || messages.length === 0) return;

    setLoadingEarlier(true);
    try {
      const oldestTimestamp = messages[0]?.timestamp;
      if (!oldestTimestamp) return;

      const earlier = await fetchEarlierMessages(conversationId, oldestTimestamp);
      if (earlier.length === 0) {
        setHasMore(false);
        return;
      }

      earlierRef.current = [...earlier, ...earlierRef.current];
      setMessages((prev) => [...earlier, ...prev]);
      if (earlier.length < PAGE_SIZE) setHasMore(false);
    } finally {
      setLoadingEarlier(false);
    }
  }, [conversationId, loadingEarlier, hasMore, messages]);

  // Marks incoming messages delivered/seen whenever the thread updates
  // while this conversation is open. Already-read older messages are
  // filtered out inside markConversationRead, so re-running this as
  // earlier pages get prepended doesn't cause redundant writes.
  useEffect(() => {
    if (!conversationId || !user || messages.length === 0) return;
    markConversationRead(conversationId, user.uid, messages).catch(() => {});
  }, [conversationId, user, messages]);

  return { messages, loading, loadingEarlier, hasMore, loadEarlier };
}
