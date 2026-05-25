import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/lib/api";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useSettings } from "@/contexts/SettingsContext";
import { getBrandChartColors } from "@/lib/colors";
import { Trash2, RefreshCw, AlertCircle } from "lucide-react";

export const AdminDashboard = () => {
  const { t } = useTranslation();
  useSettings();
  const COLORS = getBrandChartColors();
  const [data, setData] = useState<{
    summary: { revenue: number; orderCount: number; avgOrder: number; deliveryCount: number };
    dailySales: { date: string; revenue: number; orders: number }[];
    topProducts: { name: string; qty: number; revenue: number }[];
    peakHours: { hour: number; orders: number }[];
    orderTypes: { name: string; value: number }[];
    resourceCounts: {
      products: number;
      categories: number;
      offers: number;
      coupons: number;
      tables: number;
      users: number;
    };
    recentOrders: {
      _id: string;
      orderNumber: string;
      status: string;
      type: string;
      total: number;
      createdAt: string;
      tableNumber?: number;
      customerName?: string;
    }[];
    activeOffers: {
      _id: string;
      title: { en: string; ar: string };
      discountPercent: number;
      startsAt: string;
      endsAt: string;
      isActive: boolean;
    }[];
    recentProducts: {
      _id: string;
      name: { en: string; ar: string };
      price: number;
    }[];
  } | null>(null);
  const [staffData, setStaffData] = useState<any>(null);

  const load = useCallback(
    () => api.get("/analytics/dashboard").then((r) => setData(r.data)),
    []
  );

  const loadPerformance = useCallback(async () => {
    try {
      const r = await api.get("/analytics/staff/performance");
      setStaffData(r.data);
    } catch (error) {
      console.error("Failed to load staff performance", error);
    }
  }, []);

  useEffect(() => {
    load();
    loadPerformance();
  }, [load, loadPerformance]);

  useRealtimeOrders(load);

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await api.delete(`/orders/${orderId}`);
      load();
    } catch (error) {
      console.error("Failed to cancel order", error);
    }
  };

  const resetAnalytics = async () => {
    if (!confirm("Reset analytics? This will archive old data.")) return;
    try {
      await api.post("/analytics/reset");
      alert("Analytics reset successfully");
      load();
    } catch (error) {
      console.error("Failed to reset analytics", error);
    }
  };

  if (!data) return null;

  return (
    <section className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("dashboard")}</h1>
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card">
          <p className="text-sm text-stone-500">{t("revenue")}</p>
          <p className="text-2xl font-bold text-brand-600">{data.summary.revenue.toFixed(0)} EGP</p>
        </article>
        <article className="card">
          <p className="text-sm text-stone-500">{t("orderCount")}</p>
          <p className="text-2xl font-bold">{data.summary.orderCount}</p>
        </article>
        <article className="card">
          <p className="text-sm text-stone-500">Avg order</p>
          <p className="text-2xl font-bold">{data.summary.avgOrder.toFixed(0)} EGP</p>
        </article>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card">
          <p className="text-sm text-stone-500">{t("products")}</p>
          <p className="text-2xl font-bold">{data.resourceCounts.products}</p>
        </article>
        <article className="card">
          <p className="text-sm text-stone-500">{t("categories")}</p>
          <p className="text-2xl font-bold">{data.resourceCounts.categories}</p>
        </article>
        <article className="card">
          <p className="text-sm text-stone-500">{t("offers")}</p>
          <p className="text-2xl font-bold">{data.resourceCounts.offers}</p>
        </article>
        <article className="card">
          <p className="text-sm text-stone-500">{t("coupons")}</p>
          <p className="text-2xl font-bold">{data.resourceCounts.coupons}</p>
        </article>
        <article className="card">
          <p className="text-sm text-stone-500">{t("tables")}</p>
          <p className="text-2xl font-bold">{data.resourceCounts.tables}</p>
        </article>
        <article className="card">
          <p className="text-sm text-stone-500">{t("users")}</p>
          <p className="text-2xl font-bold">{data.resourceCounts.users}</p>
        </article>
      </section>
      <section className="card h-72">
        <h3 className="mb-4 font-semibold">Daily sales</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data.dailySales}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke={COLORS[0]} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <section className="card h-64">
          <h3 className="mb-2 font-semibold">{t("topProducts")}</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.topProducts}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="card h-64">
          <h3 className="mb-2 font-semibold">{t("peakHours")}</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.peakHours}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </section>
      <section className="card h-64 max-w-sm">
        <h3 className="mb-2 font-semibold">Order types</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={data.orderTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.orderTypes.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Staff Performance (7 days)</h2>
          <button
            type="button"
            onClick={loadPerformance}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        {staffData && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
              <p className="text-sm text-stone-500">Chef Performance</p>
              <p className="text-2xl font-bold">{staffData.chefMetrics.completedOrders} orders</p>
              <p className="text-sm text-stone-600">Avg prep: {staffData.chefMetrics.avgPrepTime} min</p>
            </div>
            <div className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
              <p className="text-sm text-stone-500">Waiter Performance</p>
              <p className="text-2xl font-bold">{staffData.waiterMetrics.completedOrders} orders</p>
              <p className="text-sm text-stone-600">Avg service: {staffData.waiterMetrics.avgWaitTime} min</p>
            </div>
          </div>
        )}
      </section>
      <section className="card">
        <button
          type="button"
          onClick={resetAnalytics}
          className="btn-outline flex w-full items-center justify-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <AlertCircle size={18} /> Reset Analytics (Archive old data)
        </button>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <section className="card">
          <h3 className="mb-3 font-semibold">{t("recentOrders")}</h3>
          <div className="space-y-3 text-sm">
            {data.recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between rounded-2xl border border-stone-200 p-3 dark:border-stone-700">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-stone-500">
                    {order.type} · {order.status} · {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm">{order.total.toFixed(0)} EGP{order.tableNumber ? ` · T${order.tableNumber}` : ""}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-red-500 hover:bg-red-50 rounded-lg p-2 dark:hover:bg-red-900/20"
                  onClick={() => cancelOrder(order._id)}
                  title={t("delete")}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3 className="mb-3 font-semibold">{t("activeOffers")}</h3>
          <div className="space-y-3 text-sm">
            {data.activeOffers.map((offer) => (
              <div key={offer._id} className="rounded-2xl border border-stone-200 p-3 dark:border-stone-700">
                <p className="font-semibold">{offer.title.en} / {offer.title.ar}</p>
                <p className="text-xs text-stone-500">-{offer.discountPercent}% · {new Date(offer.startsAt).toLocaleDateString()} – {new Date(offer.endsAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3 className="mb-3 font-semibold">{t("recentProducts")}</h3>
          <div className="space-y-3 text-sm">
            {data.recentProducts.map((product) => (
              <div key={product._id} className="rounded-2xl border border-stone-200 p-3 dark:border-stone-700">
                <p className="font-semibold">{product.name.en} / {product.name.ar}</p>
                <p className="text-xs text-stone-500">{product.price.toFixed(0)} EGP</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </section>
  );
};
