import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";

export const TermsConditions = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const locale = i18n.language.startsWith("ar") ? "ar" : "en";
  const content = settings?.termsAndConditions?.[locale] || t("termsConditions", "Terms and conditions content is not available.");

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-semibold">{t("termsConditions")}</h1>
      <div className="prose max-w-none whitespace-pre-wrap text-stone-700 dark:text-stone-200">
        {content}
      </div>
    </section>
  );
};
