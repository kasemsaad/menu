import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@/types";
import { OrderCard } from "@/components/OrderCard";

export const CustomerOrders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { basePath } = useOutletContext<{ basePath: string }>();
  const { customer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<Order[]>("/orders/my")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, [customer]);

  if (!customer) {
    return (
      <section className="card text-center">
        <p className="text-sm text-stone-500">{t("pleaseLoginToEditProfile")}</p>
        <button type="button" className="btn-primary mt-4" onClick={() => navigate("/customer/login")}> 
          {t("login")}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">{t("myOrders")}</h1>
            <p className="text-sm text-stone-500">{t("myOrdersHint")}</p>
          </div>
          <Link to={`${basePath}/profile`} className="btn-outline text-sm">
            {t("profile")}
          </Link>
        </div>
      </section>

      {loading ? (
        <section className="card text-center">
          <p className="text-sm text-stone-500">{t("loading")}…</p>
        </section>
      ) : orders.length === 0 ? (
        <section className="card text-center">
          <p className="text-sm text-stone-500">{t("noOrders")}</p>
        </section>
      ) : (
        <section className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              actions={
                <Link to={`${basePath}/order/${order._id}`} className="btn-outline text-xs">
                  {t("viewDetails")}
                </Link>
              }
            />
          ))}
        </section>
      )}
    </section>
  );
};
