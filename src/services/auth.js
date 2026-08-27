import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/auth";
import { createUserProfile, isUsernameAvailable } from "./users";

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function registerUser({ email, password, username, displayName }) {
  const available = await isUsernameAvailable(username);
  if (!available) {
    const err = new Error("Username is already taken.");
    err.code = "qubrains/username-taken";
    throw err;
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await createUserProfile({ uid: credential.user.uid, username, displayName });
  } catch (profileError) {
    // Roll back the auth account so a failed profile write doesn't leave an
    // orphaned login with nothing behind it.
    await deleteUser(credential.user).catch(() => {});
    throw profileError;
  }

  return credential.user;
}

export async function loginUser({ email, password, rememberMe }) {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function changeUserPassword({ currentPassword, newPassword }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in.");

  // Firebase requires a recent sign-in before allowing a password change.
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
