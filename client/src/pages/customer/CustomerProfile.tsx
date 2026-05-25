import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";

const schema = Yup.object({
  name: Yup.string().required(),
  phone: Yup.string().required(),
  address: Yup.string().required(),
  password: Yup.string().min(6),
});

export const CustomerProfile = () => {
  const { t } = useTranslation();
  const { customer, updateCustomer } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState<string | null>(null);

  if (!customer) {
    return (
      <section className="card text-center">
        <p className="text-sm text-stone-500">{t("pleaseLoginToEditProfile")}</p>
        <button type="button" className="btn-primary mt-4" onClick={() => navigate("/customer/login")}> 
          {t("login")}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="card space-y-3">
        <h1 className="font-display text-2xl font-bold">{t("profile")}</h1>
        <p className="text-sm text-stone-500">{t("editProfile")}</p>
      </section>
      <section className="card p-6">
        {success && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
        <Formik
          initialValues={{
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            password: "",
          }}
          enableReinitialize
          validationSchema={schema}
          onSubmit={async (values, { setErrors, setSubmitting }) => {
            setSuccess(null);
            try {
              await updateCustomer({
                name: values.name,
                phone: values.phone,
                address: values.address,
                password: values.password || undefined,
              });
              setSuccess(t("profileSaved"));
            } catch (err) {
              setErrors({ email: getErrorMessage(err, t("errorGeneric")) });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <Field name="name" placeholder={t("customerName")} className="input-field" />
              <Field name="email" placeholder="Email" className="input-field" disabled />
              <Field name="phone" placeholder={t("phone")} className="input-field" />
              <Field
                name="address"
                as="textarea"
                rows={3}
                placeholder={t("address")}
                className="input-field"
              />
              <Field
                name="password"
                type="password"
                placeholder={t("newPasswordOptional")}
                className="input-field"
              />
              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? t("loading") : t("save")}
              </button>
            </Form>
          )}
        </Formik>
      </section>
    </section>
  );
};
