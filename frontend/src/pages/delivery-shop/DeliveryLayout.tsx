import { Outlet, Link, useNavigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { GuestBottomNav } from "@/components/GuestBottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { AccountSummary } from "@/components/AccountSummary";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, UserPlus, LogOut } from "lucide-react";

const basePath = "/shop";

export const DeliveryLayout = () => {
  const { t } = useTranslation();
  const { customer, customerLogout } = useAuth();
  const navigate = useNavigate();

  return (
    <CartProvider>
      <section className="min-h-screen pb-20">
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-surface-light/90 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-surface-dark/90">
          <section className="mx-auto flex max-w-lg items-center justify-between gap-2">
            <BrandLogo subtitle={t("delivery")} />
            <section className="flex shrink-0 items-center gap-1">
              {customer ? (
                <>
                  <span className="hidden text-xs text-stone-500 sm:inline">{customer.name}</span>
                  <button
                    type="button"
                    className="rounded-xl p-2 text-stone-500 hover:bg-stone-100"
                    onClick={() => {
                      customerLogout();
                      navigate("/shop");
                    }}
                    title={t("logout")}
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/customer/login" className="rounded-xl p-2 text-stone-600 hover:bg-stone-100">
                    <LogIn size={18} />
                  </Link>
                  <Link to="/customer/signup" className="rounded-xl p-2 text-brand-600 hover:bg-brand-50">
                    <UserPlus size={18} />
                  </Link>
                </>
              )}
              <LangToggle />
              <ThemeToggle />
            </section>
          </section>
        </header>
        <section className="mx-auto max-w-lg px-4 py-4">
          <div className="mb-4 flex flex-wrap gap-3 text-xs text-stone-500">
            <Link to={`${basePath}/privacy`} className="underline hover:text-brand-600">
              {t("privacyPolicyLink")}
            </Link>
            <Link to={`${basePath}/terms`} className="underline hover:text-brand-600">
              {t("termsConditionsLink")}
            </Link>
          </div>
          {customer && (
            <>
              <AccountSummary
                title={t("accountDetails")}
                rows={[
                  { label: t("customerName"), value: customer.name },
                  { label: t("email"), value: customer.email },
                  { label: t("phone"), value: customer.phone },
                  { label: t("address"), value: customer.address },
                ]}
              />
              <section className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate(`${basePath}/profile`)}
                >
                  {t("editProfile")}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate(`${basePath}/orders`)}
                >
                  {t("myOrders")}
                </button>
              </section>
            </>
          )}
          <Outlet context={{ basePath, orderMode: "delivery" as const }} />
        </section>
        <GuestBottomNav basePath={basePath} />
      </section>
    </CartProvider>
  );
};
