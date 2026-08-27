import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/database";

/** Live profiles for a set of uids, keyed by uid. `uids.join(",")` is used
 * as the effect dependency instead of the array itself so this doesn't
 * re-subscribe every render just because a new array was created with the
 * same contents. */
export function useProfiles(uids) {
  const [profiles, setProfiles] = useState({});
  const key = uids.join(",");

  useEffect(() => {
    const unsubscribes = uids.flatMap((uid) => [
      onValue(ref(db, `users/${uid}`), (snap) => {
        setProfiles((prev) => ({
          ...prev,
          [uid]: { ...(prev[uid] || {}), uid, ...(snap.exists() ? snap.val() : {}) },
        }));
      }),
      onValue(ref(db, `presence/${uid}/online`), (snap) => {
        setProfiles((prev) => ({
          ...prev,
          [uid]: { ...(prev[uid] || { uid }), online: snap.val() || false },
        }));
      }),
    ]);
    return () => unsubscribes.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return profiles;
}
