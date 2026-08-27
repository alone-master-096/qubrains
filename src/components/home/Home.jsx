import { useAuth } from "../../hooks/useAuth";
import OnlineUsers from "./OnlineUsers";

export default function Home() {
  const { user, profile } = useAuth();
  const name = profile?.displayName || user?.email;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Hey, {name} 👋</h1>
      <p className="mt-1 text-sm text-zinc-500">Good to see you back on QuBrains.</p>

      <div className="mt-8">
        <OnlineUsers />
      </div>
    </div>
  );
}
