import { ref, get, set, update, remove, onValue, serverTimestamp } from "firebase/database";
import { db } from "../firebase/database";
import { createNotification } from "./notifications";

/** Live "none" | "outgoing" | "incoming" | "connected" for a pair of users.
 * Checks both directions since either person could have sent the request. */
export function subscribeToConnectionStatus(myUid, otherUid, callback) {
  let outgoing = null; // requests/{otherUid}/{myUid} — a request I sent them
  let incoming = null; // requests/{myUid}/{otherUid} — a request they sent me

  function compute() {
    if (outgoing?.status === "accepted" || incoming?.status === "accepted") return callback("connected");
    if (outgoing?.status === "pending") return callback("outgoing");
    if (incoming?.status === "pending") return callback("incoming");
    callback("none");
  }

  const unsubOutgoing = onValue(ref(db, `requests/${otherUid}/${myUid}`), (snap) => {
    outgoing = snap.val();
    compute();
  });
  const unsubIncoming = onValue(ref(db, `requests/${myUid}/${otherUid}`), (snap) => {
    incoming = snap.val();
    compute();
  });

  return () => {
    unsubOutgoing();
    unsubIncoming();
  };
}

export async function sendConnectionRequest(fromUid, toUid, fromName) {
  if (fromUid === toUid) throw new Error("You can't connect with yourself.");

  const [outgoing, incoming] = await Promise.all([
    get(ref(db, `requests/${toUid}/${fromUid}`)),
    get(ref(db, `requests/${fromUid}/${toUid}`)),
  ]);

  const outgoingStatus = outgoing.exists() ? outgoing.val().status : null;
  if (outgoingStatus === "pending" || outgoingStatus === "accepted") {
    throw new Error("A request already exists between you two.");
  }
  if (incoming.exists() && incoming.val().status === "pending") {
    throw new Error("They already sent you a request — check your notifications.");
  }

  await set(ref(db, `requests/${toUid}/${fromUid}`), { status: "pending", createdAt: serverTimestamp() });
  await createNotification({
    uid: toUid,
    type: "request",
    senderId: fromUid,
    text: `${fromName} sent you a connection request`,
    relatedId: fromUid,
  });
}

export async function acceptConnectionRequest(uid, requesterUid, myName) {
  // Realtime Database `root` in a security rule represents the data before
  // the current write. Accept the request first so the subsequent connection
  // writes can safely verify that the request is already accepted.
  await update(ref(db, `requests/${uid}/${requesterUid}`), { status: "accepted" });
  await update(ref(db), {
    [`userConnections/${uid}/${requesterUid}`]: true,
    [`userConnections/${requesterUid}/${uid}`]: true,
  });
  await createNotification({
    uid: requesterUid,
    type: "request",
    senderId: uid,
    text: `${myName} accepted your connection request`,
    relatedId: uid,
  });
}

export async function rejectConnectionRequest(uid, requesterUid) {
  await remove(ref(db, `requests/${uid}/${requesterUid}`));
}

export async function cancelConnectionRequest(fromUid, toUid) {
  await remove(ref(db, `requests/${toUid}/${fromUid}`));
}
