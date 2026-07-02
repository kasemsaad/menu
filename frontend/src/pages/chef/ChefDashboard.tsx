import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import type { Order } from "@/types";
import { OrderCard } from "@/components/OrderCard";
import { ShiftPanel } from "@/components/ShiftPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

export const ChefDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableFilter, setTableFilter] = useState("");

  const load = useCallback(() => {
    if (!user?.onShift) {
      setOrders([]);
      return;
    }
    return api.get("/orders?limit=200").then((r) => setOrders(Array.isArray(r.data) ? r.data : r.data.data));
  }, [user?.onShift]);

  useEffect(() => {
    load();
  }, [load]);

  const onNewOrder = useCallback((o: Order) => {
    setOrders((prev) => [o, ...prev.filter((x) => x._id !== o._id)]);
  }, []);

  useRealtimeOrders(load, { onNewOrder });

  const filtered = tableFilter
    ? orders.filter((o) => String(o.tableNumber) === tableFilter)
    : orders;

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  };

  const tables = [...new Set(orders.map((o) => o.tableNumber).filter(Boolean))];

  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl font-bold">{t("orders")} — Kitchen</h1>

      <ShiftPanel role="chef" onShiftChange={load} />

      {!user?.onShift ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-6 text-center text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {t("startShiftHint")}
        </p>
      ) : (
        <>
          <select
            className="input-field max-w-xs"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
          >
            <option value="">{t("allTables")}</option>
            {tables.map((n) => (
              <option key={n} value={String(n)}>
                {t("table")} {n}
              </option>
            ))}
          </select>
          <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={
                  <section className="flex flex-wrap gap-2">
                    {order.status === "pending" && (
                      <button
                        type="button"
                        className="btn-primary text-xs"
                        onClick={() => updateStatus(order._id, "preparing")}
                      >
                        {t("preparing")}
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button
                        type="button"
                        className="btn-primary text-xs"
                        onClick={() => updateStatus(order._id, "ready")}
                      >
                        {t("ready")}
                      </button>
                    )}
                    <button type="button" className="btn-outline text-xs" onClick={() => window.print()}>
                      {t("printInvoice")}
                    </button>
                  </section>
                }
              />
            ))}
          </section>
          {!filtered.length && <p className="text-stone-500">{t("noOrders")}</p>}
        </>
      )}
    </section>
  );
};
