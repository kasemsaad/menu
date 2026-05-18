import { Router } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Table } from "../models/Table.js";
import { Coupon } from "../models/Coupon.js";
import { Settings } from "../models/Settings.js";
import { auth, requireRole, AuthRequest } from "../middleware/auth.js";
import { generateOrderNumber } from "../utils/orderNumber.js";
import { emitNotification, emitOrderRoomNotification, emitWaiterTableNotification } from "../socket/index.js";
import { emitNewOrderToStaff, emitOrderUpdatedToStaff, tableIdFromOrder } from "../utils/notifyStaff.js";
import { User } from "../models/User.js";
import { customerAuth, CustomerAuthRequest } from "../middleware/customerAuth.js";
import { optionalCustomerAuth } from "../middleware/optionalCustomerAuth.js";
import { activeOrderFilter } from "../utils/orderQuery.js";

const router = Router();

const serializeOrder = (order: Awaited<ReturnType<typeof Order.findById>>) => {
  if (!order) return null;
  const o = order.toObject() as Record<string, unknown>;
  const tableId = o.tableId as { number?: number } | string | undefined;
  if (o.tableNumber == null && tableId && typeof tableId === "object" && tableId.number != null) {
    o.tableNumber = tableId.number;
  }
  return o;
};

const calcTotals = async (
  items: { subtotal: number }[],
  couponCode?: string,
  type?: string
) => {
  const settings = (await Settings.findOne()) || { taxPercent: 14, deliveryFee: 25 };
  let subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  let discount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    });
    if (coupon && subtotal >= coupon.minOrder && coupon.usedCount < coupon.maxUses) {
      discount =
        coupon.discountType === "percent"
          ? (subtotal * coupon.value) / 100
          : coupon.value;
      await Coupon.findByIdAndUpdate(coupon.id, { $inc: { usedCount: 1 } });
    }
  }

  const tax = ((subtotal - discount) * settings.taxPercent) / 100;
  const deliveryFee = type === "delivery" ? settings.deliveryFee : 0;
  const total = subtotal - discount + tax + deliveryFee;

  return { subtotal, discount, tax, deliveryFee, total };
};

router.post("/", optionalCustomerAuth, async (req: CustomerAuthRequest, res) => {
  const {
    tableId,
    items,
    type = "dine_in",
    paymentMethod = "cash",
    couponCode,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryLat,
    deliveryLng,
    notes,
  } = req.body;

  let tableNumber: number | undefined;
  if (tableId) {
    const table = await Table.findById(tableId);
    if (table) {
      tableNumber = table.number;
      table.status = "occupied";
      await table.save();
    }
  }

  const totals = await calcTotals(items, couponCode, type);
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    tableId,
    tableNumber,
    type,
    items,
    ...totals,
    paymentMethod,
    couponCode,
    customerId: req.customer?.id,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryLat,
    deliveryLng,
    notes,
    status: "pending",
  });

  const populated = await Order.findById(order.id).populate("tableId", "number");
  const serialized = serializeOrder(populated);
  await emitNewOrderToStaff(serialized);
  emitNotification("admin", { type: "new_order", order: serialized });
  res.status(201).json(serialized);
});

router.get("/guest/:id", async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, ...activeOrderFilter });
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
});

/** Guest menu: all dine-in orders placed for this table (same session / QR). */
router.get("/table/:tableId", async (req, res) => {
  const { tableId } = req.params;
  if (!mongoose.isValidObjectId(tableId)) {
    return res.status(400).json({ message: "Invalid table id" });
  }
  const orders = await Order.find({ tableId, type: "dine_in", ...activeOrderFilter })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(orders.map((o) => serializeOrder(o)));
});

router.get("/", auth, async (req: AuthRequest, res) => {
  const filter: Record<string, unknown> = { ...activeOrderFilter };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.tableId) filter.tableId = req.query.tableId;
  if (req.query.type) filter.type = req.query.type;

  const role = req.user!.role;
  if (role === "chef") {
    const chef = await User.findById(req.user!.id);
    if (!chef?.onShift) return res.json([]);
    filter.status = { $in: ["pending", "preparing", "ready"] };
  }
  if (role === "waiter") {
    const waiter = await User.findById(req.user!.id);
    if (!waiter?.onShift || !waiter.assignedTableIds?.length) return res.json([]);
    filter.type = "dine_in";
    filter.status = { $in: ["ready", "served"] };
    filter.tableId = { $in: waiter.assignedTableIds };
  }
  if (role === "delivery") {
    filter.type = "delivery";
    filter.status = { $in: ["ready", "delivering", "delivered"] };
  }

  const orders = await Order.find(filter)
    .populate("tableId", "number")
    .sort({ createdAt: 1 })
    .limit(100);
  res.json(orders.map((o) => serializeOrder(o)));
});

router.patch("/:id/status", auth, async (req: AuthRequest, res) => {
  const { status } = req.body;
  const update: Record<string, unknown> = { status };

  if (status === "delivering" && req.user?.role === "delivery") {
    update.driverId = req.user.id;
  }

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, ...activeOrderFilter },
    update,
    { new: true }
  ).populate(
    "tableId",
    "number"
  );
  if (!order) return res.status(404).json({ message: "Not found" });

  const serialized = serializeOrder(order);

  await emitOrderUpdatedToStaff(serialized);
  emitNotification("admin", { type: "order_status", order: serialized });
  emitOrderRoomNotification(order.id, { type: "status_change", order: serialized });

  if (status === "ready") {
    if (order.type === "delivery") {
      emitNotification("delivery", { type: "order_ready", order: serialized });
    } else {
      await emitWaiterTableNotification(tableIdFromOrder(serialized), {
        type: "order_ready",
        order: serialized,
      });
    }
  }
  res.json(serialized);
});

router.get("/my", customerAuth, async (req: CustomerAuthRequest, res) => {
  const orders = await Order.find({ customerId: req.customer!.id, ...activeOrderFilter })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(orders);
});

router.post("/:id/call-waiter", async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, ...activeOrderFilter },
    { callWaiter: true },
    { new: true }
  ).populate("tableId", "number");
  if (!order) return res.status(404).json({ message: "Not found" });
  const serialized = serializeOrder(order);
  await emitWaiterTableNotification(tableIdFromOrder(serialized), {
    type: "call_waiter",
    order: serialized,
  });
  emitNotification("admin", { type: "call_waiter", order: serialized });
  res.json(serialized);
});

router.post("/:id/request-bill", async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, ...activeOrderFilter }).populate(
    "tableId",
    "number"
  );
  if (!order) return res.status(404).json({ message: "Not found" });
  const serialized = serializeOrder(order);
  if (order.tableId) {
    const tid = typeof order.tableId === "object" ? order.tableId._id : order.tableId;
    await Table.findByIdAndUpdate(tid, { status: "needs_bill" });
    await emitWaiterTableNotification(tid.toString(), {
      type: "request_bill",
      order: serialized,
    });
    emitNotification("admin", { type: "request_bill", order: serialized });
  }
  res.json({ message: "Bill requested", order: serialized });
});

export default router;
