import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import type { Order, TableInfo } from "@/types";
import { OrderCard } from "@/components/OrderCard";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

export const WaiterDashboard = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);

  const load = useCallback(() => {
    api.get("/orders").then((r) => setOrders(r.data));
    api.get("/tables").then((r) => setTables(r.data));
  }, []);

  useRealtimeOrders(load);

  const markServed = async (id: string) => {
    await api.patch(`/orders/${id}/status`, { status: "served" });
    load();
  };

  return (
    <section className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Waiter — {t("orders")}</h1>
      <section>
        <h2 className="mb-3 font-semibold">{t("tables")}</h2>
        <section className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {tables.map((tb) => (
            <article
              key={tb._id}
              className={`card text-center ${
                tb.status === "needs_bill"
                  ? "ring-2 ring-amber-500"
                  : tb.status === "occupied"
                    ? "ring-2 ring-brand-500"
                    : ""
              }`}
            >
              <p className="text-2xl font-bold">{tb.number}</p>
              <p className="text-xs capitalize text-stone-500">{tb.status.replace("_", " ")}</p>
            </article>
          ))}
        </section>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            actions={
              <button type="button" className="btn-primary text-sm" onClick={() => markServed(order._id)}>
                {t("markServed")}
              </button>
            }
          />
        ))}
      </section>
    </section>
  );
};
