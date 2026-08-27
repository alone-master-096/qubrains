import { NavLink } from "react-router-dom";
import { Home as HomeIcon, MessageCircle, Bell, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../common/Avatar";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/chats", label: "Chats", icon: MessageCircle, end: false },
  { to: "/notifications", label: "Alerts", icon: Bell, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
];

export default function Sidebar({ unreadNotifications = 0 }) {
  const { user, profile } = useAuth();
  const name = profile?.displayName || user?.email;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-100 bg-paper lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal font-display text-lg font-semibold text-ink">
          Q
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">QuBrains</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-ink text-paper" : "text-zinc-600 hover:bg-zinc-100"
              }`
            }
          >
            <Icon size={18} />
            {label}
            {to === "/notifications" && unreadNotifications > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1.5 text-[10px] font-semibold text-white">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/profile" className="flex items-center gap-3 border-t border-zinc-100 px-4 py-4 hover:bg-zinc-50">
        <Avatar name={name} src={profile?.profilePic} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{name}</p>
          {profile?.username && <p className="truncate text-xs text-zinc-400">@{profile.username}</p>}
        </div>
      </NavLink>
    </aside>
  );
}
