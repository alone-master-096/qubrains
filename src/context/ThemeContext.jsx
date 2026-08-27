import { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { subscribeToSettings, updateSettings } from "../services/settings";

export const ThemeContext = createContext(undefined);

function systemPrefersDarkNow() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState("system"); // "system" | "light" | "dark"
  const [systemPrefersDark, setSystemPrefersDark] = useState(systemPrefersDarkNow);

  // Follow the signed-in user's saved preference.
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSettings(user.uid, (settings) => {
      if (settings?.theme) setThemeState(settings.theme);
    });
    return () => unsubscribe();
  }, [user]);

  // Live OS-preference changes matter while theme is "system".
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  async function setTheme(next) {
    setThemeState(next); // optimistic — settings listener will confirm
    if (user) await updateSettings(user.uid, { theme: next }).catch(() => {});
  }

  return <ThemeContext.Provider value={{ theme, setTheme, isDark }}>{children}</ThemeContext.Provider>;
}
