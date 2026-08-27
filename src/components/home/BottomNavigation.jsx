import { NavLink } from "react-router-dom";
import { Home as HomeIcon, MessageCircle, Bell, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/chats", label: "Chats", icon: MessageCircle, end: false },
  { to: "/notifications", label: "Alerts", icon: Bell, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
];

export default function BottomNavigation({ unreadNotifications = 0 }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-zinc-100 bg-paper/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
              isActive ? "text-signal" : "text-zinc-400"
            }`
          }
        >
          <span className="relative">
            <Icon size={20} />
            {to === "/notifications" && unreadNotifications > 0 && (
              <span className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-signal text-[9px] font-bold text-white">
                {unreadNotifications > 9 ? "9" : unreadNotifications}
              </span>
            )}
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
