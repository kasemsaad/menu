import type { Localized, Order } from "@/types";

export const t = (obj: Localized | undefined, lang: string) =>
  obj ? (lang === "ar" ? obj.ar : obj.en) : "";

export const formatPrice = (amount: number, currency = "EGP") =>
  `${amount.toFixed(0)} ${currency}`;

/** Resolve table number from order (supports populated tableId). */
export const getOrderTableNumber = (
  order?: Pick<Order, "tableNumber" | "tableId">
): number | undefined => {
  if (!order) return undefined;
  if (order.tableNumber != null) return order.tableNumber;
  if (order.tableId && typeof order.tableId === "object") return order.tableId.number;
  return undefined;
};

export const getOrderTableId = (order?: Pick<Order, "tableId">): string | undefined => {
  if (!order?.tableId) return undefined;
  if (typeof order.tableId === "string") return order.tableId;
  return order.tableId._id;
};

export const openWhatsApp = (phone: string, message: string) => {
  const clean = phone.replace(/\D/g, "");
  window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, "_blank");
};

export { playNotificationSound, unlockAudio } from "@/lib/sounds";
export type { SoundType } from "@/lib/sounds";
