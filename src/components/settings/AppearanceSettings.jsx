import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <section>
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Appearance</h2>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-xs font-medium transition ${
              theme === value
                ? "border-signal bg-signal/10 text-signal"
                : "border-zinc-100 text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
