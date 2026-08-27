import { ref, get, update, push, serverTimestamp } from "firebase/database";
import { db } from "../firebase/database";
import { normalizeUsername } from "../utils/validation";

export async function isUsernameAvailable(username) {
  const key = normalizeUsername(username);
  const snap = await get(ref(db, `usernames/${key}`));
  return !snap.exists();
}

/**
 * Creates the user's profile, default settings, username index entry, and
 * a welcome notification in one atomic multi-location update. They either
 * all land together or not at all, which keeps `usernames/{username}` from
 * ever pointing at a uid with no profile behind it.
 */
export async function createUserProfile({ uid, username, displayName }) {
  const usernameKey = normalizeUsername(username);
  const welcomeNotificationKey = push(ref(db, `notifications/${uid}`)).key;

  const updates = {
    [`users/${uid}`]: {
      username: usernameKey,
      displayName: displayName || username,
      profilePic: "",
      bio: "",
      createdAt: serverTimestamp(),
    },
    [`settings/${uid}`]: {
      theme: "system",
      showOnlineStatus: true,
      showLastSeen: "everyone", // "everyone" | "connections" | "nobody" — see Phase 7
    },
    [`usernames/${usernameKey}`]: uid,
    [`notifications/${uid}/${welcomeNotificationKey}`]: {
      type: "system",
      text: "Welcome to QuBrains! Open the online users list on Home to start your first chat.",
      createdAt: serverTimestamp(),
      read: false,
    },
  };

  await update(ref(db), updates);
}

export async function getUserProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? { uid, ...snap.val() } : null;
}

export async function updateUserProfile(uid, changes) {
  // `username` is excluded on purpose. It's locked immutable by
  // database.rules.json once set, and the brief doesn't call for renaming —
  // supporting it would mean atomically repointing the usernames/ index
  // *and* relaxing that immutability rule safely, which is more than this
  // app currently needs.
  const { username, ...safeChanges } = changes;
  await update(ref(db, `users/${uid}`), safeChanges);
}
