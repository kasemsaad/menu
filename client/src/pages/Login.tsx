import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";

const schema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const rolePath: Record<string, string> = {
    admin: "/admin",
    chef: "/chef",
    waiter: "/waiter",
    delivery: "/delivery",
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-amber-50 p-4 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <section className="absolute end-4 top-4 flex gap-2">
        <LangToggle />
        <ThemeToggle />
      </section>
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-stone-900">
        <h1 className="font-display text-3xl font-bold text-brand-700">{t("appName")}</h1>
        <p className="mt-1 text-stone-500">{t("login")}</p>
        <Formik
          initialValues={{ email: "admin@cafe.com", password: "admin123" }}
          validationSchema={schema}
          onSubmit={async (values, { setErrors }) => {
            try {
              const user = await login(values.email, values.password);
              navigate(rolePath[user.role] || "/admin");
            } catch {
              setErrors({ email: "Invalid credentials" });
            }
          }}
        >
          <Form className="mt-8 space-y-4">
            <section>
              <label className="text-sm font-medium">Email</label>
              <Field name="email" type="email" className="input-field mt-1" />
            </section>
            <section>
              <label className="text-sm font-medium">Password</label>
              <Field name="password" type="password" className="input-field mt-1" />
            </section>
            <button type="submit" className="btn-primary w-full">
              {t("login")}
            </button>
          </Form>
        </Formik>
        <p className="mt-4 text-center text-xs text-stone-400">
          Demo: admin@cafe.com / admin123
        </p>
        <a href="/shop" className="mt-2 block text-center text-sm text-brand-600">
          {t("delivery")} — {t("menu")}
        </a>
        <a href="/customer/login" className="mt-1 block text-center text-xs text-stone-400">
          Customer login
        </a>
      </section>
    </section>
  );
};
