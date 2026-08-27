import { ref, get, update, onValue } from "firebase/database";
import { db } from "../firebase/database";

export async function getSettings(uid) {
  const snap = await get(ref(db, `settings/${uid}`));
  return snap.exists() ? snap.val() : null;
}

export function subscribeToSettings(uid, callback) {
  const unsubscribe = onValue(ref(db, `settings/${uid}`), (snap) => {
    callback(snap.exists() ? snap.val() : null);
  });
  return unsubscribe;
}

export async function updateSettings(uid, changes) {
  await update(ref(db, `settings/${uid}`), changes);
}
