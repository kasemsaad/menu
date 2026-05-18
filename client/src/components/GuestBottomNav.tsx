import { NavLink } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, Tag, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";

type Props = { basePath: string; tableId?: string | null };

export const GuestBottomNav = ({ basePath, tableId }: Props) => {
  const { t } = useTranslation();
  const { count } = useCart();
  const link = (to: string) =>
    `flex flex-col items-center gap-0.5 text-xs transition ${to}`;

  const showTableOrders = Boolean(tableId);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
      <div className={`mx-auto flex max-w-lg ${showTableOrders ? "justify-between gap-0.5" : "justify-around"}`}>
        <NavLink
          to={basePath}
          end
          className={({ isActive }) => `${link(isActive ? "text-brand-600" : "text-stone-500")} min-w-0 flex-1`}
        >
          <Home size={22} />
          <span className="max-w-full truncate px-0.5">{t("home")}</span>
        </NavLink>
        <NavLink
          to={`${basePath}/menu`}
          className={({ isActive }) => `${link(isActive ? "text-brand-600" : "text-stone-500")} min-w-0 flex-1`}
        >
          <UtensilsCrossed size={22} />
          <span className="max-w-full truncate px-0.5">{t("menu")}</span>
        </NavLink>
        <NavLink
          to={`${basePath}/offers`}
          className={({ isActive }) => `${link(isActive ? "text-brand-600" : "text-stone-500")} min-w-0 flex-1`}
        >
          <Tag size={22} />
          <span className="max-w-full truncate px-0.5">{t("offers")}</span>
        </NavLink>
        {showTableOrders && (
          <NavLink
            to={`${basePath}/table-orders`}
            className={({ isActive }) => `${link(isActive ? "text-brand-600" : "text-stone-500")} min-w-0 flex-1`}
          >
            <ClipboardList size={22} />
            <span className="max-w-full truncate px-0.5">{t("tableOrders")}</span>
          </NavLink>
        )}
        <NavLink
          to={`${basePath}/cart`}
          className={({ isActive }) => `${link(isActive ? "text-brand-600" : "text-stone-500")} min-w-0 flex-1`}
        >
          <span className="relative">
            <ShoppingBag size={22} />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </span>
          <span className="max-w-full truncate px-0.5">{t("cart")}</span>
        </NavLink>
      </div>
    </nav>
  );
};

