import { useParams, useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Receipt } from "lucide-react";
import api from "@/lib/api";
import { joinOrder, getSocket } from "@/lib/socket";
import { playNotificationSound } from "@/lib/sounds";
import { TableCheckModal } from "@/components/TableCheckModal";
import type { AppSettings, Order, OrderStatus as OrderStatusType, TableCheck } from "@/types";
import { formatPrice } from "@/lib/utils";

export const OrderStatus = () => {
  const { orderId } = useParams();
  useOutletContext<{ basePath: string; orderMode?: string }>();
  const { t, i18n } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [billCheck, setBillCheck] = useState<TableCheck | null>(null);
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrderError(t("orderNotFound"));
      setLoadingOrder(false);
      return;
    }

    setLoadingOrder(true);
    setOrderError(null);
    api.get(`/orders/guest/${orderId}`)
      .then((r) => {
        setOrder(r.data);
        prevStatus.current = r.data.status;
      })
      .catch(() => setOrderError(t("errorGeneric")))
      .finally(() => setLoadingOrder(false));

    api.get<AppSettings>("/settings").then((r) => setSettings(r.data));
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

  if (loadingOrder) {
    return (
      <section className="card text-center">
        <p className="text-sm text-stone-500">{t("loading")}…</p>
      </section>
    );
  }

  if (orderError) {
    return (
      <section className="card text-center">
        <p className="text-sm text-red-600">{orderError}</p>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="card text-center">
        <p className="text-sm text-stone-500">{t("noOrder")}</p>
      </section>
    );
  }

  const orderTableId = typeof order.tableId === "string" ? order.tableId : order.tableId?._id;

  const handleRequestBill = async () => {
    if (!orderId) return;
    setBillError(null);
    setIsRequestingBill(true);
    try {
      const response = await api.post<{ message: string; tableCheck: TableCheck }>(
        `/orders/${orderId}/request-bill`
      );
      setBillCheck(response.data.tableCheck);
    } catch {
      setBillError(t("errorGeneric"));
    } finally {
      setIsRequestingBill(false);
    }
  };

  const locale = i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en";
  const isDelivery = order.type === "delivery";
  const servicePercent = settings?.servicePercent ?? 0;
  const serviceCharge = !isDelivery && servicePercent > 0
    ? Math.round(((order.subtotal - order.discount + order.tax) * servicePercent) / 100)
    : 0;
  const grandTotal = order.total + serviceCharge;
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

      <section className="space-y-4 rounded-3xl bg-stone-50 p-4 text-sm shadow-sm dark:bg-stone-900">
        <h3 className="text-base font-semibold">{t("products")}</h3>
        <ul className="space-y-3">
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`} className="rounded-2xl bg-white p-3 shadow-sm dark:bg-stone-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.name[locale]}</p>
                  <p className="text-xs text-stone-500">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.subtotal)}</p>
              </div>
              {item.addons.length > 0 && (
                <div className="mt-2 space-y-1 rounded-2xl bg-stone-50 px-3 py-2 text-xs text-stone-500 dark:bg-stone-800">
                  {item.addons.map((addon, addonIndex) => (
                    <p key={addonIndex} className="flex justify-between">
                      <span>{addon.name[locale]}</span>
                      <span>{formatPrice(addon.price)}</span>
                    </p>
                  ))}
                </div>
              )}
              {item.notes && (
                <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30">
                  {item.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-stone-50 p-4 text-sm shadow-sm dark:bg-stone-900">
        <dl className="space-y-3">
          <div className="flex justify-between text-sm text-stone-600">
            <dt>{t("subtotal")}</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <dt>{t("discount")}</dt>
              <dd>-{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-sm text-stone-600">
            <dt>{t("tax")}</dt>
            <dd>{formatPrice(order.tax)}</dd>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-stone-600">
              <dt>{t("deliveryFee")}</dt>
              <dd>{formatPrice(order.deliveryFee)}</dd>
            </div>
          )}
          {serviceCharge > 0 && (
            <div className="flex justify-between text-sm text-stone-600">
              <dt>{t("serviceCharge")} ({servicePercent}%)</dt>
              <dd>{formatPrice(serviceCharge)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-bold text-brand-600 dark:border-stone-700">
            <dt>{t(serviceCharge > 0 ? "grandTotal" : "total")}</dt>
            <dd>{formatPrice(serviceCharge > 0 ? grandTotal : order.total)}</dd>
          </div>
        </dl>
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
            disabled={isRequestingBill}
            onClick={handleRequestBill}
          >
            <Receipt size={18} /> {isRequestingBill ? t("loading") : t("requestBill")}
          </button>
        </section>
      )}

      {billError && <p className="text-sm text-red-600">{billError}</p>}

      <TableCheckModal
        open={Boolean(billCheck || isRequestingBill)}
        tableId={orderTableId}
        check={billCheck}
        fetchCheck={false}
        loading={isRequestingBill}
        onClose={() => setBillCheck(null)}
      />
    </section>
  );
};
