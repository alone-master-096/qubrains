import { ref, onValue, onDisconnect, set, update, serverTimestamp, get } from "firebase/database";
import { db } from "../firebase/database";

/**
 * Wires up real-time presence for `uid`. `.info/connected` fires every time
 * the client (re)connects to Realtime Database — including after a dropped
 * connection — and any previously-registered onDisconnect handler is
 * cleared when a connection drops, so it must be re-armed on every
 * reconnect, not just once on mount.
 *
 * online has no "connections" privacy tier (section 32 is plain on/off),
 * so it's still gated here at write time: if showOnlineStatus is off, we
 * simply never write true. lastSeen DOES have a "connections" tier
 * (section 33), which can't be expressed by suppressing the write for an
 * all-or-nothing audience — so it's always written truthfully now, and
 * privacy is enforced by who's allowed to *read*
 * presence/{uid}/lastSeen (see database.rules.json).
 *
 * Returns an unsubscribe function.
 */
export function initPresence(uid) {
  if (!uid) return () => {};

  const connectedRef = ref(db, ".info/connected");
  const presenceRef = ref(db, `presence/${uid}`);

  const unsubscribe = onValue(connectedRef, async (snap) => {
    if (snap.val() !== true) return;

    let shareOnline = true;
    try {
      const showOnlineSnap = await get(ref(db, `settings/${uid}/showOnlineStatus`));
      shareOnline = showOnlineSnap.val() !== false;
    } catch {
      // Default to sharing, matching the account default set at registration.
    }

    onDisconnect(presenceRef).update({ online: false, lastSeen: serverTimestamp() });
    await update(presenceRef, { online: shareOnline, lastSeen: serverTimestamp() });
  });

  return unsubscribe;
}

/** Explicitly clears online status — used on logout so it's instant instead
 * of waiting on the onDisconnect handler. */
export function markOffline(uid) {
  if (!uid) return Promise.resolve();
  return set(ref(db, `presence/${uid}/online`), false);
}
