import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import { t as loc } from "@/lib/utils";

type Props = {
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

export const BrandLogo = ({ subtitle, size = "md", showName = true, className = "" }: Props) => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const name = settings?.restaurantName
    ? loc(settings.restaurantName, i18n.language)
    : t("appName");

  return (
    <section className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      {settings?.logo ? (
        <img
          src={settings.logo}
          alt={name}
          className={`${sizes[size]} shrink-0 rounded-xl object-cover ring-1 ring-stone-200 dark:ring-stone-700`}
        />
      ) : (
        <span
          className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-xl bg-brand-100 font-display text-lg font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300`}
        >
          {name.charAt(0)}
        </span>
      )}
      {showName && (
        <section className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold text-brand-700 dark:text-brand-400">
            {name}
          </h1>
          {subtitle && <p className="truncate text-xs text-stone-500">{subtitle}</p>}
        </section>
      )}
    </section>
  );
};
