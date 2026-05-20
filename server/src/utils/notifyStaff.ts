import mongoose from "mongoose";
import { User } from "../models/User.js";
import { getIO } from "../socket/index.js";

export const tableIdFromOrder = (order: unknown): string | null => {
  const o = order as { tableId?: unknown; tableNumber?: number };
  const tid = o.tableId;
  if (tid == null) return null;
  if (typeof tid === "object" && tid !== null) {
    const rec = tid as { _id?: unknown; id?: unknown };
    const id = rec._id ?? rec.id;
    return id != null ? String(id) : null;
  }
  return String(tid);
};

export const notifyWaitersForTable = async (tableId: string | null, payload: unknown) => {
  const io = getIO();
  if (!io || !tableId || !mongoose.isValidObjectId(tableId)) return;
  const tableOid = new mongoose.Types.ObjectId(tableId);
  const waiters = await User.find({
    role: "waiter",
    onShift: true,
    isActive: true,
    assignedTableIds: tableOid,
  });
  for (const w of waiters) {
    io.to(`staff:${w._id}`).emit("notification", payload);
  }
};

export const emitOrderUpdatedToStaff = async (order: unknown) => {
  const io = getIO();
  if (!io) return;
  const tid = tableIdFromOrder(order);
  io.to("role:admin").to("role:delivery").emit("order:updated", order);
  if (tid && mongoose.isValidObjectId(tid)) {
    const tableOid = new mongoose.Types.ObjectId(tid);
    io.to(`table:${tid}`).emit("order:updated", order);
    const waiters = await User.find({
      role: "waiter",
      onShift: true,
      isActive: true,
      assignedTableIds: tableOid,
    });
    for (const w of waiters) {
      io.to(`staff:${w._id}`).emit("order:updated", order);
    }
  }
  const chefs = await User.find({ role: "chef", onShift: true, isActive: true });
  for (const c of chefs) {
    io.to(`staff:${c._id}`).emit("order:updated", order);
  }
  const o = order as { _id?: string };
  if (o._id) io.to(`order:${o._id}`).emit("order:updated", order);
};

export const emitNewOrderToStaff = async (order: unknown) => {
  const io = getIO();
  if (!io) return;
  const o = order as { type?: string };
  io.to("role:admin").emit("order:new", order);
  const chefs = await User.find({ role: "chef", onShift: true, isActive: true });
  for (const c of chefs) {
    io.to(`staff:${c._id}`).emit("order:new", order);
  }
  if (o.type === "delivery") {
    io.to("role:delivery").emit("order:new", order);
  } else {
    const tid = tableIdFromOrder(order);
    await notifyWaitersForTable(tid, { type: "new_order", order });
    if (tid) io.to(`table:${tid}`).emit("order:new", order);
  }
};
