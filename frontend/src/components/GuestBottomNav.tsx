import { NavLink } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, Tag, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";

type Props = { basePath: string; tableId?: string | null };

const navClass = (isActive: boolean) =>
  `flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition ${
    isActive ? "text-brand" : "text-stone-500 dark:text-stone-400"
  }`;

export const GuestBottomNav = ({ basePath, tableId }: Props) => {
  const { t } = useTranslation();
  const { count } = useCart();
  const showTableOrders = Boolean(tableId);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-1">
        <NavLink to={basePath} end className={({ isActive }) => navClass(isActive)} aria-label={t("home")}>
          <Home size={22} />
        </NavLink>
        <NavLink
          to={`${basePath}/menu`}
          className={({ isActive }) => navClass(isActive)}
          aria-label={t("menu")}
        >
          <UtensilsCrossed size={22} />
        </NavLink>
        <NavLink
          to={`${basePath}/offers`}
          className={({ isActive }) => navClass(isActive)}
          aria-label={t("offers")}
        >
          <Tag size={22} />
        </NavLink>
        {showTableOrders && (
          <NavLink
            to={`${basePath}/table-orders`}
            className={({ isActive }) => navClass(isActive)}
            aria-label={t("tableOrders")}
          >
            <ClipboardList size={22} />
          </NavLink>
        )}
        <NavLink
          to={`${basePath}/cart`}
          className={({ isActive }) => navClass(isActive)}
          aria-label={t("cart")}
        >
          <span className="relative">
            <ShoppingBag size={22} />
            {count > 0 && (
              <span className="bg-brand-solid absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-bold">
                {count}
              </span>
            )}
          </span>
        </NavLink>
      </div>
    </nav>
  );
};
