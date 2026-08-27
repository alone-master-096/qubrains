import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/database";

export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [presence, setPresence] = useState({});

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setPresence({});
      return;
    }

    const unsubProfile = onValue(ref(db, `users/${uid}`), (snap) => {
      setProfile(snap.exists() ? { uid, ...snap.val() } : null);
    });

    const unsubOnline = onValue(ref(db, `presence/${uid}/online`), (snap) => {
      setPresence((prev) => ({ ...prev, online: snap.val() || false }));
    });

    // Denied when this uid's showLastSeen doesn't permit us to see it —
    // that's the privacy rule working correctly, so we just omit the
    // field rather than treat it as an error.
    const unsubLastSeen = onValue(
      ref(db, `presence/${uid}/lastSeen`),
      (snap) => setPresence((prev) => ({ ...prev, lastSeen: snap.val() || null })),
      () => setPresence((prev) => ({ ...prev, lastSeen: null }))
    );

    return () => {
      unsubProfile();
      unsubOnline();
      unsubLastSeen();
    };
  }, [uid]);

  return profile ? { ...profile, ...presence } : null;
}
