import { useRef, useState } from "react";
import { Camera, Image, Trash2, Loader2 } from "lucide-react";
import Avatar from "../common/Avatar";
import CameraCapture from "../common/CameraCapture";
import { uploadProfilePicture, deleteMediaByUrl } from "../../services/storage";
import { updateUserProfile } from "../../services/users";

export default function ProfilePicture({ uid, name, src, size = 96, editable = true }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  async function applyNewPicture(file) {
    if (!file.type?.startsWith("image/")) {
      setError("Profile pictures must be images.");
      return;
    }
    if (file.size >= 5 * 1024 * 1024) {
      setError("Profile pictures must be under 5 MB.");
      return;
    }

    setError("");
    setUploading(true);
    const previousUrl = src;
    try {
      const url = await uploadProfilePicture({ uid, file });
      await updateUserProfile(uid, { profilePic: url });
      if (previousUrl) deleteMediaByUrl(previousUrl).catch(() => {});
    } catch {
      setError("Couldn't update your photo. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setShowMenu(false);
    if (file) applyNewPicture(file);
  }

  function handleCapture(blob) {
    setShowCamera(false);
    applyNewPicture(blob);
  }

  async function handleRemove() {
    setShowMenu(false);
    setUploading(true);
    try {
      await updateUserProfile(uid, { profilePic: "" });
      if (src) deleteMediaByUrl(src).catch(() => {});
    } catch {
      setError("Couldn't remove your photo. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative inline-flex">
      <Avatar name={name} src={src} size={size} />

      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/50">
          <Loader2 size={size * 0.25} className="animate-spin text-paper" />
        </span>
      )}

      {editable && !uploading && (
        <button
          onClick={() => setShowMenu((v) => !v)}
          aria-label="Change profile picture"
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-signal text-ink ring-2 ring-paper"
        >
          <Camera size={15} />
        </button>
      )}

      {showMenu && (
        <>
          <button aria-label="Close menu" onClick={() => setShowMenu(false)} className="fixed inset-0 z-10" />
          <div className="absolute left-1/2 top-full z-20 mt-2 w-52 -translate-x-1/2 rounded-2xl border border-zinc-100 bg-paper p-1.5 shadow-lg">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-zinc-50"
            >
              <Image size={16} className="text-signal" /> Choose from gallery
            </button>
            <button
              onClick={() => {
                setShowCamera(true);
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-zinc-50"
            >
              <Camera size={16} className="text-signal" /> Take photo
            </button>
            {src && (
              <button
                onClick={handleRemove}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} /> Remove photo
              </button>
            )}
          </div>
        </>
      )}

      {showCamera && <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {error && <p className="absolute top-full mt-1 w-44 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
