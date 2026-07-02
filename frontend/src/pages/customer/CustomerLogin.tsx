import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { getErrorMessage } from "@/lib/errors";

const schema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
});

export const CustomerLogin = () => {
  const { customerLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="flex min-h-screen items-center justify-center bg-page-brand p-4">
      <section className="absolute end-4 top-4 flex gap-2">
        <LangToggle />
        <ThemeToggle />
      </section>
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-stone-900">
        <h1 className="font-display text-2xl font-bold text-brand-700">{t("login")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("delivery")}</p>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schema}
          onSubmit={async (values, { setErrors }) => {
            try {
              await customerLogin(values.email, values.password);
              navigate("/shop");
            } catch (err) {
              setErrors({ email: getErrorMessage(err, t("invalidCredentials")) });
            }
          }}
        >
          <Form className="mt-6 space-y-3">
            <Field name="email" type="email" placeholder="Email" className="input-field" />
            <Field name="password" type="password" placeholder="Password" className="input-field" />
            <button type="submit" className="btn-primary w-full">
              {t("login")}
            </button>
          </Form>
        </Formik>
        <p className="mt-4 text-center text-sm text-stone-500">
          {t("signup")}?{" "}
          <Link to="/customer/signup" className="font-medium text-brand-600">
            {t("signup")}
          </Link>
        </p>
        <Link to="/shop" className="mt-2 block text-center text-xs text-stone-400">
          {t("menu")}
        </Link>
        <Link to="/login" className="mt-1 block text-center text-xs text-stone-400">
          Staff login
        </Link>
      </section>
    </section>
  );
};
