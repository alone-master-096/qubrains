import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { updateUserProfile } from "../../services/users";
import ProfilePicture from "./ProfilePicture";
import ErrorMessage from "../common/ErrorMessage";

const BIO_MAX = 150;

export default function EditProfile({ onClose }) {
  const { user, profile, setProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Enter your name.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const changes = { displayName: displayName.trim(), bio: bio.trim() };
      await updateUserProfile(user.uid, changes);
      setProfile((prev) => ({ ...prev, ...changes }));
      onClose();
    } catch {
      setError("Couldn't save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <button aria-label="Close" onClick={onClose} className="fixed inset-0 z-0 cursor-default" />
      <form
        onSubmit={handleSave}
        className="relative z-10 w-full max-w-sm rounded-t-2xl bg-paper p-5 sm:rounded-2xl"
      >
        <h2 className="font-display text-lg font-semibold text-ink">Edit profile</h2>

        <div className="mt-4 flex justify-center">
          <ProfilePicture uid={user.uid} name={profile?.displayName} src={profile?.profilePic} size={88} />
        </div>

        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-ink">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={3}
            placeholder="Tell people a bit about yourself"
            className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
          <p className="mt-1 text-right text-xs text-zinc-400">
            {bio.length}/{BIO_MAX}
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-ink transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-semibold text-paper transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
