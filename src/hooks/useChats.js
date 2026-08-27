import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { subscribeToUserConversations } from "../services/chats";

export function useChats() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }
    const unsubscribe = subscribeToUserConversations(user.uid, (list) => {
      setConversations(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return { conversations, loading };
}
