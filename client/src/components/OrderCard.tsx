import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Order, OrderStatus } from "@/types";
import { formatPrice, getOrderTableNumber } from "@/lib/utils";
import { Clock, ChefHat } from "lucide-react";
import { ProductDetailModal } from "./ProductDetailModal";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  ready: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  served: "bg-stone-100 text-stone-600",
  delivering: "bg-purple-100 text-purple-800",
  delivered: "bg-stone-100 text-stone-500",
  cancelled: "bg-red-100 text-red-800",
};

interface Props {
  order: Order;
  actions?: React.ReactNode;
  showItems?: boolean;
}

export const OrderCard = ({ order, actions, showItems = true }: Props) => {
  const { t } = useTranslation();
  const tableNum = getOrderTableNumber(order);
  const [productIdToShow, setProductIdToShow] = useState<string | undefined>(undefined);
  const createdAt = new Date(order.createdAt);
  const minutesAgo = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000));
  const orderAge = minutesAgo === 0 ? t("justNow") : t("orderAgeMinutes", { minutes: minutesAgo });
  const driver = order.type === "delivery" && typeof order.driverId === "object" ? order.driverId : undefined;

  return (
    <article className="card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm font-bold text-brand-600">{order.orderNumber}</p>
            {tableNum != null && order.type === "dine_in" && (
              <span className="rounded-lg bg-brand-600 px-2.5 py-0.5 text-sm font-bold text-white">
                {t("table")} {tableNum}
              </span>
            )}
            {order.type === "delivery" && (
              <span className="rounded-lg bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
                {t("delivery")}
              </span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-500">
            <Clock size={14} />
            {new Date(order.createdAt).toLocaleTimeString()} · {orderAge}
          </p>
          {order.type === "delivery" && driver?.name && (
            <p className="text-xs text-stone-500">
              {t("driver")}: {driver.name}
              {driver.phone ? ` · ${driver.phone}` : ""}
            </p>
          )}
          {order.type === "delivery" && order.customerName && (
            <p className="text-xs text-stone-500">
              {order.customerName}
              {order.customerPhone && ` · ${order.customerPhone}`}
            </p>
          )}
          {order.deliveryAddress && (
            <p className="line-clamp-2 text-xs text-stone-400">{order.deliveryAddress}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
          {t(order.status)}
        </span>
      </div>
      {showItems && (
        <ul className="space-y-3 border-t border-stone-100 pt-2 text-sm dark:border-stone-800">
          {order.items.map((item, i) => (
            <li key={i} className="space-y-1 rounded-xl bg-stone-50 p-3 dark:bg-stone-900">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {item.quantity}× {item.name.en}
                    </span>
                    {/* show details button if productId present */}
                    {typeof item.productId === "string" && (
                      <button
                        type="button"
                        className="btn-outline text-xs ml-2"
                        onClick={() => setProductIdToShow(item.productId as string)}
                      >
                        {t("details")}
                      </button>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-xs text-stone-500">
                      {t("notes")}: {item.notes}
                    </p>
                  )}
                </div>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
              {item.addons?.length > 0 && (
                <div className="space-y-1 text-xs text-stone-500">
                  <p className="font-medium text-stone-700 dark:text-stone-200">{t("addons")}:</p>
                  <ul className="space-y-1 pl-3">
                    {item.addons.map((addon, ai) => (
                      <li key={ai} className="flex items-center justify-between gap-3 text-stone-500">
                        <span>{addon.name.en}</span>
                        <span>{formatPrice(addon.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <ProductDetailModal productId={productIdToShow} onClose={() => setProductIdToShow(undefined)} />
      {order.callWaiter && (
        <p className="flex items-center gap-1 text-sm font-medium text-amber-600">
          <ChefHat size={16} />
          {tableNum != null ? `${t("table")} ${tableNum} — ${t("callWaiter")}` : t("callWaiter")}
        </p>
      )}
      <div className="flex items-center justify-between border-t border-stone-100 pt-2 dark:border-stone-800">
        <span className="font-bold">{formatPrice(order.total)}</span>
        {actions}
      </div>
    </article>
  );
};
