import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { initPresence } from "../services/presence";

export function usePresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = initPresence(user.uid);
    return () => unsubscribe();
  }, [user]);
}
