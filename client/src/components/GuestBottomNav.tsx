import { NavLink } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";

export const GuestBottomNav = ({ basePath }: { basePath: string }) => {
  const { t } = useTranslation();
  const { count } = useCart();
  const link = (to: string) =>
    `flex flex-col items-center gap-0.5 text-xs transition ${to}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
      <div className="mx-auto flex max-w-lg justify-around">
        <NavLink to={basePath} end className={({ isActive }) => link(isActive ? "text-brand-600" : "text-stone-500")}>
          <Home size={22} />
          {t("home")}
        </NavLink>
        <NavLink to={`${basePath}/menu`} className={({ isActive }) => link(isActive ? "text-brand-600" : "text-stone-500")}>
          <UtensilsCrossed size={22} />
          {t("menu")}
        </NavLink>
        <NavLink to={`${basePath}/offers`} className={({ isActive }) => link(isActive ? "text-brand-600" : "text-stone-500")}>
          <Tag size={22} />
          {t("offers")}
        </NavLink>
        <NavLink to={`${basePath}/cart`} className={({ isActive }) => link(isActive ? "text-brand-600" : "text-stone-500")}>
          <span className="relative">
            <ShoppingBag size={22} />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </span>
          {t("cart")}
        </NavLink>
      </div>
    </nav>
  );
};

