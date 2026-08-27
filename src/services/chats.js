import {
  ref,
  push,
  get,
  set,
  update,
  onValue,
  runTransaction,
  query,
  orderByChild,
  limitToLast,
  endAt,
  serverTimestamp,
} from "firebase/database";
import { db } from "../firebase/database";
import { createNotification } from "./notifications";

const MESSAGES_PAGE_SIZE = 30;

export function getConversationId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

/** Returns the existing conversation id for this pair, creating it (plus
 * both participants' userConversations entries) if it doesn't exist yet. */
export async function ensureConversation(myUid, otherUid) {
  const conversationId = getConversationId(myUid, otherUid);
  const snap = await get(ref(db, `conversations/${conversationId}`));

  if (!snap.exists()) {
    const now = serverTimestamp();
    await update(ref(db), {
      [`conversations/${conversationId}`]: {
        participants: { [myUid]: true, [otherUid]: true },
        createdAt: now,
        lastMessage: "",
        lastMessageType: "text",
        lastMessageTime: now,
      },
      [`userConversations/${myUid}/${conversationId}`]: {
        otherUid,
        lastMessage: "",
        lastMessageType: "text",
        lastMessageTime: now,
        unreadCount: 0,
      },
      [`userConversations/${otherUid}/${conversationId}`]: {
        otherUid: myUid,
        lastMessage: "",
        lastMessageType: "text",
        lastMessageTime: now,
        unreadCount: 0,
      },
    });
  }

  return conversationId;
}

export async function getConversationParticipants(conversationId) {
  const snap = await get(ref(db, `conversations/${conversationId}/participants`));
  return snap.exists() ? Object.keys(snap.val()) : [];
}

const MESSAGE_PREVIEWS = {
  text: (msg) => msg.text,
};

async function sendMessage({ conversationId, senderId, senderName, receiverId, messageData }) {
  const newMessageRef = push(ref(db, `chats/${conversationId}/messages`));
  const now = serverTimestamp();
  const fullMessage = { senderId, receiverId, timestamp: now, delivered: false, seen: false, ...messageData };
  const preview = MESSAGE_PREVIEWS[messageData.type]?.(fullMessage) || "Message";

  await update(ref(db), {
    [`chats/${conversationId}/messages/${newMessageRef.key}`]: fullMessage,
    [`conversations/${conversationId}/lastMessage`]: preview,
    [`conversations/${conversationId}/lastMessageType`]: messageData.type,
    [`conversations/${conversationId}/lastMessageTime`]: now,
    [`userConversations/${senderId}/${conversationId}/lastMessage`]: preview,
    [`userConversations/${senderId}/${conversationId}/lastMessageType`]: messageData.type,
    [`userConversations/${senderId}/${conversationId}/lastMessageTime`]: now,
    [`userConversations/${receiverId}/${conversationId}/lastMessage`]: preview,
    [`userConversations/${receiverId}/${conversationId}/lastMessageType`]: messageData.type,
    [`userConversations/${receiverId}/${conversationId}/lastMessageTime`]: now,
    [`conversations/${conversationId}/typing/${senderId}`]: false,
  });

  // Not part of the atomic update above — RTD can't mix a multi-path set
  // with a read-modify-write increment in one call. A transaction is the
  // correct primitive for "+1" and guards against lost updates if messages
  // arrive in quick succession.
  const unreadResult = await runTransaction(
    ref(db, `userConversations/${receiverId}/${conversationId}/unreadCount`),
    (current) => (current || 0) + 1
  );

  // Only notify on the message that takes the recipient from caught-up to
  // having something unread — not once per message — so a burst of
  // messages doesn't flood their notification feed the way it already
  // doesn't flood the chat list (which has its own unread badge).
  if (unreadResult.committed && unreadResult.snapshot.val() === 1) {
    await createNotification({
      uid: receiverId,
      type: "message",
      senderId,
      text: `${senderName || "Someone"} sent you a message`,
      relatedId: conversationId,
    }).catch(() => {});
  }
}

export async function sendTextMessage({ conversationId, senderId, senderName, receiverId, text }) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await sendMessage({ conversationId, senderId, senderName, receiverId, messageData: { type: "text", text: trimmed } });
}

/** Live subscription to the most recent page of messages. Firebase's
 * limitToLast queries stay live — new messages entering the window
 * trigger a fresh callback automatically, same as before, just bounded
 * to MESSAGES_PAGE_SIZE instead of the entire conversation. */
export function subscribeToRecentMessages(conversationId, callback) {
  const q = query(
    ref(db, `chats/${conversationId}/messages`),
    orderByChild("timestamp"),
    limitToLast(MESSAGES_PAGE_SIZE)
  );

  const unsubscribe = onValue(q, (snapshot) => {
    const data = snapshot.val() || {};
    const messages = Object.entries(data)
      .map(([id, msg]) => ({ id, ...msg }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    callback(messages);
  });

  return unsubscribe;
}

/** One-time fetch of the page immediately before `beforeTimestamp`, for
 * "load earlier messages" on scroll-up. Not live — once loaded, an older
 * message's delivered/seen flags changing wouldn't be reflected without a
 * fresh fetch, which is an accepted trade-off: those flags essentially
 * only ever change once, shortly after a message is sent. */
export async function fetchEarlierMessages(conversationId, beforeTimestamp) {
  const q = query(
    ref(db, `chats/${conversationId}/messages`),
    orderByChild("timestamp"),
    endAt(beforeTimestamp - 1),
    limitToLast(MESSAGES_PAGE_SIZE)
  );

  const snapshot = await get(q);
  const data = snapshot.val() || {};
  return Object.entries(data)
    .map(([id, msg]) => ({ id, ...msg }))
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

export function subscribeToUserConversations(uid, callback) {
  const unsubscribe = onValue(ref(db, `userConversations/${uid}`), (snapshot) => {
    const data = snapshot.val() || {};
    const conversations = Object.entries(data)
      .map(([id, conv]) => ({ id, ...conv }))
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    callback(conversations);
  });
  return unsubscribe;
}

/**
 * Marks every message not sent by `uid` as delivered + seen, and clears
 * uid's unread counter. There's no push/background infrastructure in this
 * stack, so a true "delivered while away" receipt isn't achievable — both
 * flags fire together, at the point the recipient actually opens the
 * conversation. Kept as two separate fields (not merged into one) so a
 * proper server-driven delivered receipt can slot in later without a
 * schema change.
 */
export async function markConversationRead(conversationId, uid, messages) {
  const updates = {};
  let hasUnseen = false;

  for (const msg of messages) {
    if (msg.senderId !== uid && (!msg.seen || !msg.delivered)) {
      updates[`chats/${conversationId}/messages/${msg.id}/delivered`] = true;
      updates[`chats/${conversationId}/messages/${msg.id}/seen`] = true;
      hasUnseen = true;
    }
  }

  if (hasUnseen) await update(ref(db), updates);
  await set(ref(db, `userConversations/${uid}/${conversationId}/unreadCount`), 0);
}

export function setTypingStatus(conversationId, uid, isTyping) {
  return set(ref(db, `conversations/${conversationId}/typing/${uid}`), isTyping);
}

export function subscribeToTyping(conversationId, myUid, callback) {
  const unsubscribe = onValue(ref(db, `conversations/${conversationId}/typing`), (snapshot) => {
    const data = snapshot.val() || {};
    const someoneElseTyping = Object.entries(data).some(([uid, typing]) => uid !== myUid && typing);
    callback(someoneElseTyping);
  });
  return unsubscribe;
}
