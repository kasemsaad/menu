import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";

const schema = Yup.object({
  name: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
  phone: Yup.string().required(),
  address: Yup.string().required(),
});

export const CustomerSignup = () => {
  const { customerRegister } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-amber-50 p-4 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <section className="absolute end-4 top-4 flex gap-2">
        <LangToggle />
        <ThemeToggle />
      </section>
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-stone-900">
        <h1 className="font-display text-2xl font-bold text-brand-700">{t("signup")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("delivery")}</p>
        <Formik
          initialValues={{ name: "", email: "", password: "", phone: "", address: "" }}
          validationSchema={schema}
          onSubmit={async (values, { setErrors }) => {
            try {
              await customerRegister(values);
              navigate("/shop");
            } catch {
              setErrors({ email: "Registration failed" });
            }
          }}
        >
          <Form className="mt-6 space-y-3">
            <Field name="name" placeholder={t("customerName")} className="input-field" />
            <Field name="email" type="email" placeholder="Email" className="input-field" />
            <Field name="password" type="password" placeholder="Password" className="input-field" />
            <Field name="phone" placeholder={t("phone")} className="input-field" />
            <Field name="address" as="textarea" rows={2} placeholder={t("address")} className="input-field" />
            <button type="submit" className="btn-primary w-full">
              {t("signup")}
            </button>
          </Form>
        </Formik>
        <p className="mt-4 text-center text-sm text-stone-500">
          {t("login")}?{" "}
          <Link to="/customer/login" className="font-medium text-brand-600">
            {t("login")}
          </Link>
        </p>
        <Link to="/shop" className="mt-2 block text-center text-xs text-stone-400">
          {t("menu")}
        </Link>
      </section>
    </section>
  );
};
