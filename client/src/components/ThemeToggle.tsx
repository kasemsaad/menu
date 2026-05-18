import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-xl p-2 text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

