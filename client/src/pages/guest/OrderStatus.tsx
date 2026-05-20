import { useParams, useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Receipt } from "lucide-react";
import api from "@/lib/api";
import { joinOrder, getSocket } from "@/lib/socket";
import { playNotificationSound } from "@/lib/sounds";
import type { Order, OrderStatus as OrderStatusType } from "@/types";
import { formatPrice } from "@/lib/utils";

export const OrderStatus = () => {
  const { orderId } = useParams();
  useOutletContext<{ basePath: string; orderMode?: string }>();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/guest/${orderId}`).then((r) => {
      setOrder(r.data);
      prevStatus.current = r.data.status;
    });
    joinOrder(orderId);
    const socket = getSocket();

    const onUpdate = (o: Order) => {
      if (o._id !== orderId) return;
      if (prevStatus.current && o.status !== prevStatus.current) {
        playNotificationSound(
          o.status === "ready" || o.status === "delivered" ? "success" : "update"
        );
      }
      prevStatus.current = o.status;
      setOrder(o);
    };

    const onNotif = (p: { order?: Order }) => {
      if (p.order?._id === orderId) onUpdate(p.order);
    };

    socket.on("order:updated", onUpdate);
    socket.on("notification", onNotif);

    return () => {
      socket.off("order:updated", onUpdate);
      socket.off("notification", onNotif);
    };
  }, [orderId]);

  if (!order) return null;

  const isDelivery = order.type === "delivery";
  const steps: OrderStatusType[] = isDelivery
    ? ["pending", "preparing", "ready", "delivering", "delivered"]
    : ["pending", "preparing", "ready", "served"];
  const current = steps.indexOf(order.status as OrderStatusType);

  return (
    <section className="space-y-6">
      <section className="card text-center">
        <p className="font-mono text-sm text-brand-600">{order.orderNumber}</p>
        <h2 className="mt-2 font-display text-xl font-bold">{t("orderStatus")}</h2>
        <p className="mt-1 text-xs capitalize text-stone-500">
          {isDelivery ? t("delivery") : t("dineIn")}
        </p>
        <p className="mt-4 text-3xl font-bold text-brand-600">{t(order.status)}</p>
        <p className="mt-2 text-stone-500">{formatPrice(order.total)}</p>
        {isDelivery && order.deliveryAddress && (
          <p className="mt-2 text-xs text-stone-500">{order.deliveryAddress}</p>
        )}
      </section>
      <section className="flex justify-between px-1">
        {steps.map((s, i) => (
          <section key={s} className="flex flex-1 flex-col items-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                i <= current ? "bg-brand-solid" : "bg-stone-200 dark:bg-stone-700"
              }`}
            >
              {i + 1}
            </span>
            <span className="mt-1 text-center text-[9px] leading-tight text-stone-500">{t(s)}</span>
          </section>
        ))}
      </section>
      {!isDelivery && (
        <section className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="btn-outline"
            onClick={() => api.post(`/orders/${orderId}/call-waiter`)}
          >
            <Bell size={18} /> {t("callWaiter")}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => api.post(`/orders/${orderId}/request-bill`)}
          >
            <Receipt size={18} /> {t("requestBill")}
          </button>
        </section>
      )}
    </section>
  );
};
