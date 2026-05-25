import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import api from "@/lib/api";
import type { Order } from "@/types";
import { OrderCard } from "@/components/OrderCard";
import { MapView } from "@/components/MapView";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { openWhatsApp } from "@/lib/utils";

export const AdminDelivery = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(() => api.get("/orders?type=delivery").then((r) => setOrders(r.data)), []);

  useRealtimeOrders(load);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4">
        <h1 className="font-display text-2xl font-bold">{t("delivery")}</h1>
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            actions={
              <section className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline text-xs" onClick={() => setSelected(order)}>
                  {t("deliveryMap")}
                </button>
                {order.customerPhone && (
                  <button
                    type="button"
                    className="btn-outline text-xs text-emerald-600"
                    onClick={() => openWhatsApp(order.customerPhone!, `Order ${order.orderNumber}`)}
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                )}
                {order.status === "ready" && (
                  <button type="button" className="btn-primary text-xs" onClick={() => updateStatus(order._id, "delivering")}>{t("startDelivery")}</button>
                )}
                {order.status === "delivering" && (
                  <button type="button" className="btn-primary text-xs" onClick={() => updateStatus(order._id, "delivered")}>{t("delivered")}</button>
                )}
              </section>
            }
          />
        ))}
      </section>
      <section className="card sticky top-24 h-fit">
        <h2 className="font-semibold">{t("deliveryMap")}</h2>
        {selected?.deliveryLat && selected?.deliveryLng ? (
          <>
            {typeof selected.driverId === "object" && selected.driverId?.name ? (
              <p className="mt-2 text-sm text-stone-500">{t("driver")}: {selected.driverId.name}</p>
            ) : (
              <p className="mt-2 text-sm text-stone-500">{t("noDriverAssigned")}</p>
            )}
            <section className="mt-3 overflow-hidden rounded-xl">
              <MapView lat={selected.deliveryLat} lng={selected.deliveryLng} label={selected.deliveryAddress} />
            </section>
          </>
        ) : (
          <p className="mt-4 text-sm text-stone-500">{t("selectDeliveryOrder")}</p>
        )}
      </section>
    </section>
  );
};

export default AdminDelivery;
