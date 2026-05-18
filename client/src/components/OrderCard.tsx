import { useTranslation } from "react-i18next";
import type { Order, OrderStatus } from "@/types";
import { formatPrice, getOrderTableNumber } from "@/lib/utils";
import { Clock, ChefHat } from "lucide-react";

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
          <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
            <Clock size={14} />
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
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
        <ul className="space-y-1 border-t border-stone-100 pt-2 text-sm dark:border-stone-800">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {item.quantity}× {item.name.en}
              </span>
              <span>{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      )}
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
