import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNavigation from "./BottomNavigation";
import { usePresence } from "../../hooks/usePresence";
import { useNotifications } from "../../hooks/useNotifications";
import { useTheme } from "../../hooks/useTheme";

export default function AppShell() {
  usePresence();
  const { unreadCount } = useNotifications();
  const { isDark } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden bg-paper ${isDark ? "dark" : ""}`}>
      <Sidebar unreadNotifications={unreadCount} />

      <div className="flex h-full min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-zinc-100 px-4 py-3 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal font-display text-sm font-semibold text-ink">
            Q
          </span>
          <span className="font-display text-base font-semibold">QuBrains</span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <BottomNavigation unreadNotifications={unreadCount} />
    </div>
  );
}
