import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import api from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin } from "lucide-react";

export const DeliveryCheckout = () => {
  const { basePath } = useOutletContext<{ basePath: string }>();
  const { t } = useTranslation();
  const { items, clear, total } = useCart();
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [deliveryFee, setDeliveryFee] = useState(25);
  const [taxPercent, setTaxPercent] = useState(14);

  useEffect(() => {
    api.get("/settings").then((r) => {
      setDeliveryFee(r.data.deliveryFee ?? 25);
      setTaxPercent(r.data.taxPercent ?? 14);
    });
  }, []);

  useEffect(() => {
    if (!items.length) navigate(`${basePath}/cart`, { replace: true });
  }, [items.length, basePath, navigate]);

  const schema = Yup.object({
    customerName: Yup.string().required(),
    customerPhone: Yup.string().required(),
    deliveryAddress: Yup.string().required(),
    paymentMethod: Yup.string().required(),
    couponCode: Yup.string(),
  });

  const tax = (total * taxPercent) / 100;
  const grandTotal = total + tax + deliveryFee;

  const locate = (setFieldValue: (f: string, v: unknown) => void) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setFieldValue("deliveryLat", pos.coords.latitude);
      setFieldValue("deliveryLng", pos.coords.longitude);
    });
  };

  if (!items.length) return null;

  return (
    <Formik
      initialValues={{
        customerName: customer?.name ?? "",
        customerPhone: customer?.phone ?? "",
        deliveryAddress: customer?.address ?? "",
        deliveryLat: customer?.deliveryLat ?? "",
        deliveryLng: customer?.deliveryLng ?? "",
        paymentMethod: "cash",
        couponCode: "",
        notes: "",
      }}
      enableReinitialize
      validationSchema={schema}
      onSubmit={async (values) => {
        const { data } = await api.post("/orders", {
          type: "delivery",
          items,
          paymentMethod: values.paymentMethod,
          couponCode: values.couponCode || undefined,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          deliveryAddress: values.deliveryAddress,
          deliveryLat: values.deliveryLat ? Number(values.deliveryLat) : undefined,
          deliveryLng: values.deliveryLng ? Number(values.deliveryLng) : undefined,
          notes: values.notes || undefined,
        });
        clear();
        if (values.paymentMethod === "paymob") {
          const pay = await api.post("/payment/paymob/initiate", { orderId: data._id });
          if (pay.data.paymentUrl) window.location.href = pay.data.paymentUrl;
        }
        navigate(`${basePath}/order/${data._id}`);
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-4">
          {!customer && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              <a href="/customer/signup" className="font-semibold underline">
                {t("signup")}
              </a>{" "}
              {t("deliverySignupHint")}
            </p>
          )}
          <section className="card space-y-3">
            <Field name="customerName" placeholder={t("customerName")} className="input-field" />
            <Field name="customerPhone" placeholder={t("phone")} className="input-field" />
            <Field
              name="deliveryAddress"
              as="textarea"
              rows={2}
              placeholder={t("address")}
              className="input-field"
            />
            <button
              type="button"
              className="btn-outline flex w-full items-center justify-center gap-2 text-sm"
              onClick={() => locate(setFieldValue)}
            >
              <MapPin size={16} /> {t("useMyLocation")}
            </button>
          </section>
          <section className="card space-y-2 text-sm">
            <p className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span>{total} EGP</span>
            </p>
            <p className="flex justify-between">
              <span>{t("tax")}</span>
              <span>{tax.toFixed(0)} EGP</span>
            </p>
            <p className="flex justify-between">
              <span>{t("deliveryFee")}</span>
              <span>{deliveryFee} EGP</span>
            </p>
            <p className="flex justify-between border-t pt-2 text-base font-bold">
              <span>{t("total")}</span>
              <span className="text-brand-600">{grandTotal.toFixed(0)} EGP</span>
            </p>
          </section>
          <section>
            <label className="text-sm font-medium">{t("applyCoupon")}</label>
            <Field name="couponCode" className="input-field mt-1" placeholder="WELCOME10" />
          </section>
          <section className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 dark:border-stone-700">
              <input
                type="radio"
                name="paymentMethod"
                checked={values.paymentMethod === "cash"}
                onChange={() => setFieldValue("paymentMethod", "cash")}
              />
              {t("cash")}
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 dark:border-stone-700">
              <input
                type="radio"
                name="paymentMethod"
                checked={values.paymentMethod === "paymob"}
                onChange={() => setFieldValue("paymentMethod", "paymob")}
              />
              {t("paymob")}
            </label>
          </section>
          <button type="submit" className="btn-primary w-full">
            {t("confirmOrder")}
          </button>
        </Form>
      )}
    </Formik>
  );
};
