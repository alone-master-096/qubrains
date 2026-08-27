import { useEffect, useState } from "react";
import { Eye, Clock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { subscribeToSettings, updateSettings } from "../../services/settings";

const LAST_SEEN_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "connections", label: "Connections" },
  { value: "nobody", label: "Nobody" },
];

export default function PrivacySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSettings(user.uid, setSettings);
    return () => unsubscribe();
  }, [user]);

  function handleToggleOnline() {
    if (!user || !settings) return;
    updateSettings(user.uid, { showOnlineStatus: !settings.showOnlineStatus });
  }

  function handleLastSeenChange(value) {
    if (user) updateSettings(user.uid, { showLastSeen: value });
  }

  if (!settings) return null;

  return (
    <section>
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Privacy</h2>
      <div className="mt-2 space-y-5 rounded-2xl border border-zinc-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Eye size={17} className="shrink-0 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-ink">Online status</p>
              <p className="text-xs text-zinc-400">Let others see when you're online</p>
            </div>
          </div>
          <button
            onClick={handleToggleOnline}
            role="switch"
            aria-checked={settings.showOnlineStatus}
            aria-label="Show my online status"
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              settings.showOnlineStatus ? "bg-signal" : "bg-zinc-200"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                settings.showOnlineStatus ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <Clock size={17} className="text-zinc-400" />
            <p className="text-sm font-medium text-ink">Last seen</p>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {LAST_SEEN_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleLastSeenChange(value)}
                className={`rounded-xl border px-2 py-2 text-xs font-medium transition ${
                  settings.showLastSeen === value
                    ? "border-signal bg-signal/10 text-signal"
                    : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
