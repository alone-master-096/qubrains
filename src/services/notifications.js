import { ref, push, update, remove, onValue, serverTimestamp } from "firebase/database";
import { db } from "../firebase/database";

/** type: "message" | "request" | "status" | "system" */
export async function createNotification({ uid, type, senderId, text, relatedId }) {
  const notifRef = push(ref(db, `notifications/${uid}`));
  const payload = { type, text, createdAt: serverTimestamp(), read: false };
  if (senderId) payload.senderId = senderId;
  if (relatedId) payload.relatedId = relatedId;
  await update(ref(db, `notifications/${uid}/${notifRef.key}`), payload);
}

export function subscribeToNotifications(uid, callback) {
  const unsubscribe = onValue(ref(db, `notifications/${uid}`), (snapshot) => {
    const data = snapshot.val() || {};
    const list = Object.entries(data)
      .map(([id, n]) => ({ id, ...n }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(list);
  });
  return unsubscribe;
}

export async function markNotificationRead(uid, notificationId) {
  await update(ref(db, `notifications/${uid}/${notificationId}`), { read: true });
}

export async function markAllNotificationsRead(uid, notifications) {
  const updates = {};
  for (const n of notifications) {
    if (!n.read) updates[`notifications/${uid}/${n.id}/read`] = true;
  }
  if (Object.keys(updates).length) await update(ref(db), updates);
}

export async function deleteNotification(uid, notificationId) {
  await remove(ref(db, `notifications/${uid}/${notificationId}`));
}
