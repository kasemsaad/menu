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

const COLORS = ["#ea580c", "#f97316", "#fdba74", "#fed7aa"];

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<{
    summary: { revenue: number; orderCount: number; avgOrder: number };
    dailySales: { date: string; revenue: number; orders: number }[];
    topProducts: { name: string; qty: number; revenue: number }[];
    peakHours: { hour: number; orders: number }[];
    orderTypes: { name: string; value: number }[];
  } | null>(null);

  const load = useCallback(
    () => api.get("/analytics/dashboard").then((r) => setData(r.data)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeOrders(load);

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
      <section className="card h-72">
        <h3 className="mb-4 font-semibold">Daily sales</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data.dailySales}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} />
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
              <Bar dataKey="qty" fill="#ea580c" radius={[4, 4, 0, 0]} />
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
              <Bar dataKey="orders" fill="#f97316" />
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
    </section>
  );
};
