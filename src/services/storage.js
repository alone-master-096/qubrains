import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/storage";

export async function uploadProfilePicture({ uid, file }) {
  const name = file.name || `avatar-${Date.now()}.jpg`;
  const safeName = name.replace(/[^\w.-]/g, "_");
  const path = `profilePictures/${uid}/${Date.now()}_${safeName}`;
  const fileRef = storageRef(storage, path);
  await uploadBytesResumable(fileRef, file, file.type ? { contentType: file.type } : undefined);
  return getDownloadURL(fileRef);
}

/** Best-effort delete by download URL for profile-picture cleanup. */
export async function deleteMediaByUrl(url) {
  if (!url) return;
  try {
    await deleteObject(storageRef(storage, url));
  } catch {
    // Already gone, or the URL didn't parse — nothing more to do.
  }
}
