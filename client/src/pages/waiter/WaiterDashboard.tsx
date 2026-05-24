import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { AccountSummary } from "@/components/AccountSummary";
import { TableCheckModal } from "@/components/TableCheckModal";
import api from "@/lib/api";
import type { Order, TableInfo } from "@/types";
import { OrderCard } from "@/components/OrderCard";
import { ShiftPanel } from "@/components/ShiftPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

export const WaiterDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [checkTableId, setCheckTableId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user?.onShift) {
      setOrders([]);
      setTables([]);
      return;
    }
    api.get("/orders").then((r) => setOrders(r.data));
    api.get("/tables").then((r) => setTables(r.data));
  }, [user?.onShift]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeOrders(load);

  const markServed = async (id: string) => {
    await api.patch(`/orders/${id}/status`, { status: "served" });
    load();
  };

  const resetTable = async (tableId: string) => {
    await api.post(`/tables/${tableId}/reset`);
    load();
  };

  const statusLabel = (status: string) => {
    const key = status as "available" | "occupied" | "needs_bill";
    return t(key) !== key ? t(key) : status.replace("_", " ");
  };

  return (
    <section className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Waiter — {t("orders")}</h1>

      <ShiftPanel role="waiter" onShiftChange={load} />

      {user && (
        <AccountSummary
          title={t("accountDetails")}
          rows={[
            { label: t("name"), value: user.name },
            { label: t("email"), value: user.email },
            { label: t("role"), value: user.role },
            { label: t("shift"), value: user.onShift ? t("shiftActive") : t("shiftInactive") },
            {
              label: t("assignedTables"),
              value: user.assignedTableIds?.length ? `${user.assignedTableIds.length}` : t("none"),
            },
          ]}
        />
      )}

      {!user?.onShift ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-6 text-center text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {t("startShiftHint")}
        </p>
      ) : (
        <>
          <section>
            <h2 className="mb-3 font-semibold">{t("tables")}</h2>
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {tables.map((tb) => (
                <article
                  key={tb._id}
                  className={`card flex flex-col items-center gap-2 text-center ${
                    tb.status === "needs_bill"
                      ? "ring-2 ring-amber-500"
                      : tb.status === "occupied"
                        ? "ring-2 ring-brand-500"
                        : ""
                  }`}
                >
                  <p className="text-2xl font-bold">{tb.number}</p>
                  <p className="text-xs capitalize text-stone-500">{statusLabel(tb.status)}</p>
                  {tb.status === "needs_bill" && (
                    <button
                      type="button"
                      className="btn-primary mt-1 w-full gap-1 py-1.5 text-xs"
                      onClick={() => resetTable(tb._id)}
                    >
                      <RotateCcw size={14} />
                      {t("resetTable")}
                    </button>
                  )}
                </article>
              ))}
            </section>
            {!tables.length && (
              <p className="text-sm text-stone-500">{t("selectTables")}</p>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={
                  order.status === "ready" ? (
                    <button
                      type="button"
                      className="btn-primary text-sm"
                      onClick={() => markServed(order._id)}
                    >
                      {t("markServed")}
                    </button>
                  ) : undefined
                }
              />
            ))}
            {!orders.length && <p className="text-stone-500">{t("noOrders")}</p>}
          </section>
        </>
      )}

      <TableCheckModal
        tableId={checkTableId}
        open={Boolean(checkTableId)}
        onClose={() => setCheckTableId(null)}
      />
    </section>
  );
};
