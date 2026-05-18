import { Link, useOutletContext } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Order, TableInfo } from "@/types";
import { formatPrice } from "@/lib/utils";

const orderTableId = (o: Order) => {
  const t = o.tableId;
  if (typeof t === "string") return t;
  if (t && typeof t === "object" && "_id" in t) return (t as { _id: string })._id;
  return "";
};

export const GuestTableOrders = () => {
  const { table, basePath } = useOutletContext<{ table: TableInfo | null; basePath: string }>();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!table?._id) return;
    const { data } = await api.get<Order[]>(`/orders/table/${table._id}`);
    setOrders(data);
  }, [table?._id]);

  useEffect(() => {
    if (!table?._id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [table?._id, load]);

  useEffect(() => {
    if (!table?._id) return;
    const socket = getSocket();
    const tid = table._id;

    const onNew = (o: Order) => {
      if (orderTableId(o) !== tid || o.type !== "dine_in") return;
      setOrders((prev) => (prev.some((x) => x._id === o._id) ? prev : [o, ...prev]));
    };
    const onUpd = (o: Order) => {
      if (orderTableId(o) !== tid) return;
      if (o.deletedAt) {
        setOrders((prev) => prev.filter((x) => x._id !== o._id));
        return;
      }
      setOrders((prev) => {
        const i = prev.findIndex((x) => x._id === o._id);
        if (i === -1) return [o, ...prev];
        const next = [...prev];
        next[i] = { ...next[i], ...o };
        return next;
      });
    };

    const onCleared = (p: { tableId?: string }) => {
      if (p.tableId === tid) setOrders([]);
    };

    socket.on("order:new", onNew);
    socket.on("order:updated", onUpd);
    socket.on("table:cleared", onCleared);
    return () => {
      socket.off("order:new", onNew);
      socket.off("order:updated", onUpd);
      socket.off("table:cleared", onCleared);
    };
  }, [table?._id]);

  if (!table) {
    return <p className="text-center text-sm text-stone-500">{t("scanQrFirst")}</p>;
  }

  if (loading) {
    return <p className="text-center text-sm text-stone-500">…</p>;
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-bold">{t("tableOrders")}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {t("table")} {table.number} — {t("tableOrdersHint")}
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl bg-stone-100 px-4 py-8 text-center text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-400">
          {t("noOrders")}
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o._id}>
              <Link
                to={`${basePath}/order/${o._id}`}
                className="card flex items-center justify-between gap-3 transition hover:ring-2 hover:ring-brand-500/30"
              >
                <div className="min-w-0 text-start">
                  <p className="font-mono text-sm font-semibold text-brand-600">{o.orderNumber}</p>
                  <p className="mt-0.5 capitalize text-stone-500">{t(o.status)}</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {formatPrice(o.total)}
                  </p>
                </div>
                <ChevronRight className="shrink-0 text-stone-400" size={22} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
