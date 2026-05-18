import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import type { Settings } from "@/types";

export const AdminSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data));
  }, []);

  if (!settings) return null;

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="font-display text-2xl font-bold">{t("settings")}</h1>
      <Formik
        initialValues={{
          taxPercent: settings.taxPercent,
          deliveryFee: settings.deliveryFee,
          whatsappNumber: settings.whatsappNumber,
          nameEn: settings.restaurantName.en,
          nameAr: settings.restaurantName.ar,
        }}
        onSubmit={async (v) => {
          await api.patch("/settings", {
            taxPercent: Number(v.taxPercent),
            deliveryFee: Number(v.deliveryFee),
            whatsappNumber: v.whatsappNumber,
            restaurantName: { en: v.nameEn, ar: v.nameAr },
          });
          alert("Saved");
        }}
      >
        <Form className="card space-y-3">
          <Field name="nameEn" className="input-field" placeholder="Restaurant EN" />
          <Field name="nameAr" className="input-field" placeholder="Restaurant AR" />
          <Field name="taxPercent" type="number" className="input-field" />
          <Field name="deliveryFee" type="number" className="input-field" />
          <Field name="whatsappNumber" className="input-field" />
          <button type="submit" className="btn-primary">{t("save")}</button>
        </Form>
      </Formik>
    </section>
  );
};
