import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import api from "@/lib/api";
import { openWhatsApp } from "@/lib/utils";
import type { Order } from "@/types";
import { OrderCard } from "@/components/OrderCard";
import { MapView } from "@/components/MapView";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

export const DeliveryDashboard = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(() => api.get("/orders").then((r) => setOrders(r.data)), []);

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
                  Map
                </button>
                {order.customerPhone && (
                  <button
                    type="button"
                    className="btn-outline text-xs text-emerald-600"
                    onClick={() =>
                      openWhatsApp(order.customerPhone!, `Order ${order.orderNumber}`)
                    }
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                )}
                {order.status === "ready" && (
                  <button type="button" className="btn-primary text-xs" onClick={() => updateStatus(order._id, "delivering")}>
                    {t("startDelivery")}
                  </button>
                )}
                {order.status === "delivering" && (
                  <button type="button" className="btn-primary text-xs" onClick={() => updateStatus(order._id, "delivered")}>
                    {t("delivered")}
                  </button>
                )}
              </section>
            }
          />
        ))}
      </section>
      <section className="card sticky top-24 h-fit">
        <h2 className="font-semibold">Live map (OpenStreetMap)</h2>
        {selected?.deliveryLat && selected?.deliveryLng ? (
          <section className="mt-3 overflow-hidden rounded-xl">
            <MapView lat={selected.deliveryLat} lng={selected.deliveryLng} label={selected.deliveryAddress} />
          </section>
        ) : (
          <p className="mt-4 text-sm text-stone-500">Select a delivery order with coordinates</p>
        )}
      </section>
    </section>
  );
};
