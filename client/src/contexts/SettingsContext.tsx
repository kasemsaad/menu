import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import api from "@/lib/api";
import { applyBrandTheme, normalizeHex } from "@/lib/colors";
import { configureNotificationSounds } from "@/lib/sounds";
import type { AppSettings } from "@/types";

const SettingsContext = createContext<{
  settings: AppSettings | null;
  loading: boolean;
  refresh: () => Promise<void>;
}>({
  settings: null,
  loading: true,
  refresh: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await api.get<AppSettings>("/settings");
    setSettings(data);
    applyBrandTheme(
      normalizeHex(data.primaryColor),
      normalizeHex(data.accentColor, normalizeHex(data.primaryColor))
    );
    configureNotificationSounds(data.notificationSounds, data.soundVolume ?? 0.85);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
