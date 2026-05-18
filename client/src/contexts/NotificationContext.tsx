import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getSocket, joinRole } from "@/lib/socket";
import { playNotificationSound, unlockAudio, type SoundType } from "@/lib/sounds";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@/types";
import { getOrderTableNumber } from "@/lib/utils";
import { Bell, Volume2, VolumeX } from "lucide-react";

type Toast = { id: string; message: string; type: "info" | "success" | "warning" };

const NotificationContext = createContext<{
  toasts: Toast[];
  dismiss: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
}>({
  toasts: [],
  dismiss: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
});

const orderLabel = (order?: Order) => order?.orderNumber ?? "";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("soundEnabled") !== "false"
  );

  const push = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-5), { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 8000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const alert = useCallback(
    (sound: SoundType, message: string, type: Toast["type"] = "info") => {
      if (soundEnabled) playNotificationSound(sound);
      push(message, type);
    },
    [soundEnabled, push]
  );

  const toggleSound = (v: boolean) => {
    setSoundEnabled(v);
    localStorage.setItem("soundEnabled", String(v));
    if (v) unlockAudio();
  };

  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    joinRole(user.role);
    const socket = getSocket();
    const role = user.role;

    const onNotification = (payload: { type?: string; order?: Order }) => {
      const num = orderLabel(payload.order);
      switch (payload.type) {
        case "new_order":
          if (role === "waiter") alert("newOrder", t("notifNewOrder", { num }), "info");
          break;
        case "order_ready":
          if (role === "waiter" && payload.order?.type !== "delivery")
            alert("success", t("notifOrderReady", { num }), "success");
          if (role === "delivery")
            alert("success", t("notifPickup", { num }), "success");
          if (role === "admin")
            alert("success", t("notifOrderReady", { num }), "success");
          break;
        case "call_waiter": {
          const table = getOrderTableNumber(payload.order) ?? "?";
          if (role === "waiter")
            alert("urgent", t("notifCallWaiter", { table }), "warning");
          if (role === "admin")
            alert("urgent", t("notifCallWaiterAdmin", { table }), "warning");
          break;
        }
        case "request_bill": {
          const table = getOrderTableNumber(payload.order) ?? "?";
          if (role === "waiter")
            alert("urgent", t("notifRequestBill", { table }), "warning");
          if (role === "admin")
            alert("urgent", t("notifRequestBillAdmin", { table }), "warning");
          break;
        }
        case "order_status":
          if (role === "admin")
            alert("update", t("notifStatusChange", { num, status: t(payload.order?.status ?? "pending") }), "info");
          break;
        default:
          alert("update", t("notifGeneric"), "info");
      }
    };

    const onNewOrder = (order: Order) => {
      const num = orderLabel(order);
      if (role === "chef") alert("newOrder", t("notifNewOrder", { num }), "info");
      else if (role === "admin") alert("newOrder", t("notifNewOrder", { num }), "info");
      else if (role === "delivery" && order.type === "delivery")
        alert("newOrder", t("notifNewDelivery", { num }), "info");
    };

    const onOrderUpdated = (order: Order) => {
      if (role === "chef" && order.status === "cancelled")
        alert("urgent", t("notifCancelled", { num: orderLabel(order) }), "warning");
    };

    socket.on("notification", onNotification);
    socket.on("order:new", onNewOrder);
    socket.on("order:updated", onOrderUpdated);

    return () => {
      socket.off("notification", onNotification);
      socket.off("order:new", onNewOrder);
      socket.off("order:updated", onOrderUpdated);
    };
  }, [user, alert, t]);

  return (
    <NotificationContext.Provider
      value={{ toasts, dismiss, soundEnabled, setSoundEnabled: toggleSound }}
    >
      {children}
      {user && (
        <button
          type="button"
          className="fixed bottom-24 end-4 z-[99] flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg md:bottom-6"
          title={soundEnabled ? t("soundOn") : t("soundOff")}
          onClick={() => toggleSound(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}
      {toasts.length > 0 && (
        <section className="pointer-events-none fixed end-4 top-4 z-[100] flex w-[min(100%,22rem)] flex-col gap-2">
          <p className="pointer-events-none flex items-center gap-1 text-xs font-medium text-stone-500">
            <Bell size={14} /> {t("notifications")}
          </p>
          {toasts.map((toast) => (
            <article
              key={toast.id}
              className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-2 ring-white/20 ${
                toast.type === "success"
                  ? "bg-emerald-600 text-white"
                  : toast.type === "warning"
                    ? "bg-amber-500 text-white"
                    : "bg-stone-900 text-white dark:bg-stone-800"
              }`}
              onClick={() => dismiss(toast.id)}
            >
              {toast.message}
            </article>
          ))}
        </section>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
