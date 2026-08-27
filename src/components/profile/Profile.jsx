import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { logoutUser } from "../../services/auth";
import { markOffline } from "../../services/presence";
import ProfilePicture from "./ProfilePicture";
import EditProfile from "./EditProfile";

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  async function handleLogout() {
    try {
      if (user) await markOffline(user.uid);
      await logoutUser();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 text-center sm:px-6">
      <div className="flex justify-center">
        <ProfilePicture uid={user.uid} name={profile?.displayName} src={profile?.profilePic} size={96} />
      </div>

      <h1 className="mt-4 font-display text-xl font-semibold text-ink">{profile?.displayName}</h1>
      {profile?.username && <p className="text-sm text-zinc-400">@{profile.username}</p>}
      {profile?.bio && <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-600">{profile.bio}</p>}

      <div className="mt-8 space-y-1 text-left">
        <button
          onClick={() => setEditing(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink transition hover:bg-zinc-50"
        >
          <Pencil size={17} className="text-zinc-400" />
          Edit profile
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink transition hover:bg-zinc-50"
        >
          <SettingsIcon size={17} className="text-zinc-400" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>

      {editing && <EditProfile onClose={() => setEditing(false)} />}
    </div>
  );
}
