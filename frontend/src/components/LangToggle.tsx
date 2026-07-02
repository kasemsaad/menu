import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LangToggle = () => {
  const { i18n } = useTranslation();
  const toggle = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
    >
      <Languages size={18} />
      {i18n.language === "ar" ? "EN" : "ع"}
    </button>
  );
};

