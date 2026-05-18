import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import api from "@/lib/api";
import { useCart } from "@/contexts/CartContext";

export const GuestCheckout = () => {
  const { basePath } = useOutletContext<{ basePath: string }>();
  const { t } = useTranslation();
  const { items, clear, total } = useCart();
  const navigate = useNavigate();
  const tableId = sessionStorage.getItem("tableId");

  const schema = Yup.object({
    paymentMethod: Yup.string().required(),
    couponCode: Yup.string(),
  });

  return (
    <Formik
      initialValues={{ paymentMethod: "cash", couponCode: "" }}
      validationSchema={schema}
      onSubmit={async (values) => {
        if (!tableId) {
          alert(t("scanQrFirst") || "Please scan the table QR code first");
          return;
        }
        const { data } = await api.post("/orders", {
          tableId,
          type: "dine_in",
          items,
          paymentMethod: values.paymentMethod,
          couponCode: values.couponCode || undefined,
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
          <section className="card space-y-2">
            <p className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span>{total} EGP</span>
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
