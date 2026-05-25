import { useEffect, useState, useRef, useMemo, type ChangeEvent } from "react";
import { Formik, Form, Field } from "formik";
import { useTranslation } from "react-i18next";
import { ImagePlus } from "lucide-react";
import api from "@/lib/api";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/useToast";
import { applyBrandTheme, normalizeHex } from "@/lib/colors";
import { readFileAsDataUrl } from "@/lib/upload";
import { SoundUploadField } from "@/components/SoundUploadField";
import { configureNotificationSounds } from "@/lib/sounds";
import type { AppSettings } from "@/types";

type FormValues = {
  nameEn: string;
  nameAr: string;
  taxPercent: number;
  servicePercent: number;
  deliveryFee: number;
  whatsappNumber: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  openTime: string;
  closeTime: string;
  soundNewOrder: string;
  soundUrgent: string;
  soundSuccess: string;
  soundUpdate: string;
  privacyEn: string;
  privacyAr: string;
  termsEn: string;
  termsAr: string;
  soundVolume: number;
};

const toForm = (s: AppSettings): FormValues => ({
  nameEn: s.restaurantName?.en ?? "",
  nameAr: s.restaurantName?.ar ?? "",
  taxPercent: s.taxPercent,
  servicePercent: s.servicePercent ?? 15,
  deliveryFee: s.deliveryFee,
  whatsappNumber: s.whatsappNumber ?? "",
  logo: s.logo ?? "",
  primaryColor: s.primaryColor ?? "#ea580c",
  accentColor: s.accentColor ?? "#f97316",
  openTime: s.openTime ?? "09:00",
  closeTime: s.closeTime ?? "23:00",
  soundNewOrder: s.notificationSounds?.newOrder ?? "",
  soundUrgent: s.notificationSounds?.urgent ?? "",
  soundSuccess: s.notificationSounds?.success ?? "",
  soundUpdate: s.notificationSounds?.update ?? "",
  privacyEn: s.privacyPolicy?.en ?? "",
  privacyAr: s.privacyPolicy?.ar ?? "",
  termsEn: s.termsAndConditions?.en ?? "",
  termsAr: s.termsAndConditions?.ar ?? "",
  soundVolume: s.soundVolume ?? 0.85,
});

const LogoField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) => (
  <div className="flex items-center gap-4">
    {value ? (
      <img src={value} alt="" className="h-20 w-20 rounded-xl object-cover ring-1 ring-stone-200" />
    ) : (
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
        <ImagePlus size={28} />
      </div>
    )}
    <div className="flex flex-1 flex-col gap-2">
      <input
        type="text"
        placeholder="Logo URL"
        className="input-field"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      <label className="btn-outline cursor-pointer text-center text-sm">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) onChange(await readFileAsDataUrl(file));
          }}
        />
        Upload logo
      </label>
    </div>
  </div>
);

export const AdminSettings = () => {
  const { t } = useTranslation();
  const { settings, refresh } = useSettings();
  const { showToast, showError } = useToast();
  const [saved, setSaved] = useState(false);
  const DRAFT_KEY = "admin_settings_draft_v1";
  const latestValuesRef = useRef<FormValues | null>(null);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [saved]);

  const initialValues = useMemo(() => {
    if (!settings) return undefined;
    const base = toForm(settings);
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (draft && typeof draft === "object") {
        return { ...base, ...draft } as FormValues;
      }
    } catch (e) {
      // ignore parse errors
    }
    return base as FormValues;
  }, [settings]);

  if (!settings || !initialValues) return null;

  return (
    <section className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("settings")}</h1>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (v) => {
          const primary = normalizeHex(v.primaryColor);
          const accent = normalizeHex(v.accentColor, primary);
          try {
            await api.patch("/settings", {
              taxPercent: Number(v.taxPercent),
              servicePercent: Number(v.servicePercent),
              deliveryFee: Number(v.deliveryFee),
              whatsappNumber: v.whatsappNumber,
              restaurantName: { en: v.nameEn, ar: v.nameAr },
              logo: v.logo || undefined,
              primaryColor: primary,
              accentColor: accent,
              privacyPolicy: { en: v.privacyEn, ar: v.privacyAr },
              termsAndConditions: { en: v.termsEn, ar: v.termsAr },
              openTime: v.openTime,
              closeTime: v.closeTime,
              notificationSounds: {
                newOrder: v.soundNewOrder || undefined,
                urgent: v.soundUrgent || undefined,
                success: v.soundSuccess || undefined,
                update: v.soundUpdate || undefined,
              },
              soundVolume: Number(v.soundVolume),
            });
            applyBrandTheme(primary, accent);
            await refresh();
            // clear saved draft after successful persist
            try {
              localStorage.removeItem(DRAFT_KEY);
            } catch {}
            setSaved(true);
            showToast(t("saved"), "success");
          } catch (err) {
            showError(err);
          }
        }}
      >
        {({ values, setFieldValue }) => {
          // keep latest values in ref for autosave and unload checks
          latestValuesRef.current = values;

          useEffect(() => {
            // autosave draft every 2s
            const id = setInterval(() => {
              try {
                if (latestValuesRef.current) {
                  localStorage.setItem(DRAFT_KEY, JSON.stringify(latestValuesRef.current));
                }
              } catch {}
            }, 2000);
            return () => clearInterval(id);
          }, []);

          useEffect(() => {
            // warn before unload if there are unsaved changes
            const handler = (e: BeforeUnloadEvent) => {
              try {
                const initial = initialValues;
                const current = latestValuesRef.current;
                if (!initial || !current) return;
                if (JSON.stringify(initial) !== JSON.stringify(current)) {
                  e.preventDefault();
                  e.returnValue = "";
                }
              } catch {}
            };
            window.addEventListener("beforeunload", handler);
            return () => window.removeEventListener("beforeunload", handler);
          }, []);
          const applyPreview = (primary: string, accent: string) => {
            applyBrandTheme(primary, accent);
            configureNotificationSounds(
              {
                newOrder: values.soundNewOrder || undefined,
                urgent: values.soundUrgent || undefined,
                success: values.soundSuccess || undefined,
                update: values.soundUpdate || undefined,
              },
              Number(values.soundVolume)
            );
          };

          return (
            <Form className="space-y-6">
              <section className="card space-y-4">
                <h2 className="font-semibold">{t("branding")}</h2>
                <LogoField value={values.logo} onChange={(url) => setFieldValue("logo", url)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("primaryColor")}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={values.primaryColor}
                        onChange={(e) => {
                          const next = e.target.value;
                          setFieldValue("primaryColor", next);
                          applyPreview(next, values.accentColor);
                        }}
                        className="h-10 w-14 cursor-pointer rounded-lg border border-stone-200"
                      />
                      <input
                        type="text"
                        name="primaryColor"
                        className="input-field font-mono uppercase"
                        value={values.primaryColor}
                        onChange={(e) => {
                          const next = e.target.value;
                          setFieldValue("primaryColor", next);
                          applyPreview(next, values.accentColor);
                        }}
                      />
                    </div>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("accentColor")}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={values.accentColor}
                        onChange={(e) => {
                          const next = e.target.value;
                          setFieldValue("accentColor", next);
                          applyPreview(values.primaryColor, next);
                        }}
                        className="h-10 w-14 cursor-pointer rounded-lg border border-stone-200"
                      />
                      <input
                        type="text"
                        name="accentColor"
                        className="input-field font-mono uppercase"
                        value={values.accentColor}
                        onChange={(e) => {
                          const next = e.target.value;
                          setFieldValue("accentColor", next);
                          applyPreview(values.primaryColor, next);
                        }}
                      />
                    </div>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 rounded-xl bg-stone-50 p-3 dark:bg-stone-800/50">
                  <span
                    className="rounded-lg px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: values.primaryColor }}
                  >
                    Primary
                  </span>
                  <span
                    className="rounded-lg px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${values.primaryColor} 18%, white)`,
                      color: values.primaryColor,
                    }}
                  >
                    Light
                  </span>
                  <span
                    className="rounded-lg px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: values.accentColor }}
                  >
                    Accent
                  </span>
                </div>
              </section>

              <section className="card space-y-4">
                <h2 className="font-semibold">{t("notificationSounds")}</h2>
                <label className="block space-y-1 text-sm">
                  <span className="font-medium">{t("soundVolume")}</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={values.soundVolume}
                    onChange={(e) => {
                      setFieldValue("soundVolume", Number(e.target.value));
                      configureNotificationSounds(
                        {
                          newOrder: values.soundNewOrder || undefined,
                          urgent: values.soundUrgent || undefined,
                          success: values.soundSuccess || undefined,
                          update: values.soundUpdate || undefined,
                        },
                        Number(e.target.value)
                      );
                    }}
                    className="w-full"
                  />
                  <span className="text-xs text-stone-500">
                    {Math.round(values.soundVolume * 100)}%
                  </span>
                </label>
                <SoundUploadField
                  label={t("soundNewOrder")}
                  soundType="newOrder"
                  value={values.soundNewOrder}
                  onChange={(url) => {
                    setFieldValue("soundNewOrder", url);
                    applyPreview(values.primaryColor, values.accentColor);
                  }}
                />
                <SoundUploadField
                  label={t("soundUrgent")}
                  soundType="urgent"
                  value={values.soundUrgent}
                  onChange={(url) => {
                    setFieldValue("soundUrgent", url);
                    applyPreview(values.primaryColor, values.accentColor);
                  }}
                />
                <SoundUploadField
                  label={t("soundSuccess")}
                  soundType="success"
                  value={values.soundSuccess}
                  onChange={(url) => {
                    setFieldValue("soundSuccess", url);
                    applyPreview(values.primaryColor, values.accentColor);
                  }}
                />
                <SoundUploadField
                  label={t("soundUpdate")}
                  soundType="update"
                  value={values.soundUpdate}
                  onChange={(url) => {
                    setFieldValue("soundUpdate", url);
                    applyPreview(values.primaryColor, values.accentColor);
                  }}
                />
              </section>

              <section className="card space-y-3">
                <h2 className="font-semibold">{t("settings")}</h2>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Restaurant Name (EN)</span>
                  <Field name="nameEn" className="input-field" placeholder="Restaurant EN" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Restaurant Name (AR)</span>
                  <Field name="nameAr" className="input-field" placeholder="Restaurant AR" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">{t("taxPercent")}</span>
                  <Field name="taxPercent" type="number" min={0} className="input-field" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">{t("servicePercent")}</span>
                  <Field name="servicePercent" type="number" min={0} max={100} className="input-field" />
                  <p className="text-xs text-stone-500">{t("servicePercentHint")}</p>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">{t("deliveryFee")}</span>
                  <Field name="deliveryFee" type="number" min={0} className="input-field" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">WhatsApp Number</span>
                  <Field name="whatsappNumber" className="input-field" placeholder="+201234567890" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("openTime")}</span>
                    <Field name="openTime" type="time" className="input-field" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("closeTime")}</span>
                    <Field name="closeTime" type="time" className="input-field" />
                  </label>
                </div>
                <p className="text-xs text-stone-500">{t("closeTimeHint")}</p>
              </section>

              <section className="card space-y-4">
                <h2 className="font-semibold">{t("privacyPolicy")}</h2>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">{t("english")}</span>
                  <Field as="textarea" name="privacyEn" className="input-field min-h-[8rem]" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">{t("arabic")}</span>
                  <Field as="textarea" name="privacyAr" className="input-field min-h-[8rem]" />
                </label>
              </section>

              <section className="card space-y-4">
                <h2 className="font-semibold">{t("termsConditions")}</h2>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">{t("english")}</span>
                  <Field as="textarea" name="termsEn" className="input-field min-h-[8rem]" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">{t("arabic")}</span>
                  <Field as="textarea" name="termsAr" className="input-field min-h-[8rem]" />
                </label>
              </section>

              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary">
                  {t("save")}
                </button>
                {saved && <span className="text-sm text-emerald-600">{t("saved")}</span>}
              </div>
            </Form>
          );
        }}
      </Formik>
    </section>
  );
};
