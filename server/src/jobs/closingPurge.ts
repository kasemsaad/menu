import { Settings } from "../models/Settings.js";
import { Order } from "../models/Order.js";
import { activeOrderFilter } from "../utils/orderQuery.js";
import { emitTableCleared } from "../socket/index.js";

const parseMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export const runClosingPurge = async () => {
  const settings = await Settings.findOne();
  if (!settings?.closeTime) return;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const closeMinutes = parseMinutes(settings.closeTime);

  if (nowMinutes < closeMinutes) return;

  const today = todayKey(now);
  if (settings.lastClosingPurgeDate === today) return;

  const tableIds = await Order.distinct("tableId", {
    ...activeOrderFilter,
    tableId: { $ne: null },
  });
  await Order.updateMany(activeOrderFilter, { deletedAt: now });
  for (const tid of tableIds) {
    if (tid) emitTableCleared(String(tid));
  }
  settings.lastClosingPurgeDate = today;
  await settings.save();
  console.log(`[closingPurge] Soft-deleted active orders at ${settings.closeTime}`);
};

export const startClosingPurgeJob = () => {
  runClosingPurge().catch((err) => console.error("[closingPurge]", err));
  setInterval(() => {
    runClosingPurge().catch((err) => console.error("[closingPurge]", err));
  }, 60_000);
};
