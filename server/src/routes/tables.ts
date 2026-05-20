import { Router } from "express";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { Table } from "../models/Table.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { auth, requireRole, AuthRequest } from "../middleware/auth.js";
import { activeOrderFilter } from "../utils/orderQuery.js";
import { emitTableCleared, emitNotification, emitWaiterTableNotification } from "../socket/index.js";
import { buildTableCheck } from "../utils/tableCheck.js";

const router = Router();
const clientUrl = () => process.env.CLIENT_URL;

router.get("/", auth, requireRole("admin", "waiter"), async (req: AuthRequest, res) => {
  const filter: Record<string, unknown> = {};
  if (req.user?.role === "waiter" && req.query.all !== "true") {
    const waiter = await User.findById(req.user.id);
    if (!waiter?.onShift) {
      return res.json([]);
    }
    if (waiter.assignedTableIds?.length) {
      filter._id = { $in: waiter.assignedTableIds };
    }
  }
  const tables = await Table.find(filter).sort("number");
  res.json(tables);
});

router.get("/qr/:qrCode", async (req, res) => {
  const table = await Table.findOne({ qrCode: req.params.qrCode });
  if (!table) return res.status(404).json({ message: "Table not found" });
  res.json(table);
});

router.post("/", auth, requireRole("admin"), async (req, res) => {
  const qrCode = uuidv4();
  const table = await Table.create({ ...req.body, qrCode });
  const menuUrl = `${clientUrl()}/menu/${qrCode}`;
  const qrImage = await QRCode.toDataURL(menuUrl);
  res.status(201).json({ table, menuUrl, qrImage });
});

router.get("/:id/qr", auth, requireRole("admin"), async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) return res.status(404).json({ message: "Not found" });
  const menuUrl = `${clientUrl()}/menu/${table.qrCode}`;
  const qrImage = await QRCode.toDataURL(menuUrl, { width: 400, margin: 2 });
  res.json({ menuUrl, qrImage, table });
});

router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  const { number, capacity, status } = req.body;
  const update: Record<string, unknown> = {};
  if (number !== undefined) update.number = number;
  if (capacity !== undefined) update.capacity = capacity;
  if (status !== undefined) update.status = status;
  const table = await Table.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!table) return res.status(404).json({ message: "Not found" });
  res.json(table);
});

router.patch("/:id/status", auth, requireRole("admin", "waiter"), async (req: AuthRequest, res) => {
  if (req.user?.role === "waiter") {
    const waiter = await User.findById(req.user.id);
    if (!waiter?.onShift) return res.status(403).json({ message: "Start your shift first" });
    const allowed = waiter.assignedTableIds?.some((id) => id.toString() === req.params.id);
    if (!allowed) return res.status(403).json({ message: "Table not in your assignment" });
  }
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!table) return res.status(404).json({ message: "Not found" });
  res.json(table);
});

/** Combined bill for all active dine-in orders on this table (incl. service %). */
router.get("/:id/check", auth, requireRole("admin", "waiter"), async (req: AuthRequest, res) => {
  if (req.user?.role === "waiter") {
    const waiter = await User.findById(req.user.id);
    if (!waiter?.onShift) return res.status(403).json({ message: "Start your shift first" });
    const allowed = waiter.assignedTableIds?.some((id) => id.toString() === req.params.id);
    if (!allowed) return res.status(403).json({ message: "Table not in your assignment" });
  }
  const check = await buildTableCheck(req.params.id);
  if (!check) return res.status(404).json({ message: "Not found" });
  res.json(check);
});

/** Guest or staff: request bill for entire table session */
router.post("/:id/request-bill", async (req, res) => {
  const check = await buildTableCheck(req.params.id);
  if (!check) return res.status(404).json({ message: "Not found" });
  if (!check.orderCount) {
    return res.status(400).json({ message: "No active orders on this table" });
  }
  await Table.findByIdAndUpdate(req.params.id, { status: "needs_bill" });
  const payload = { type: "request_bill", tableCheck: check };
  await emitWaiterTableNotification(req.params.id, payload);
  emitNotification("admin", payload);
  res.json({ message: "Bill requested", tableCheck: check });
});

/** Clear table after bill — sets available and clears waiter-call flags */
router.post("/:id/reset", auth, requireRole("admin", "waiter"), async (req: AuthRequest, res) => {
  if (req.user?.role === "waiter") {
    const waiter = await User.findById(req.user.id);
    if (!waiter?.onShift) return res.status(403).json({ message: "Start your shift first" });
    const allowed = waiter.assignedTableIds?.some((id) => id.toString() === req.params.id);
    if (!allowed) return res.status(403).json({ message: "Table not in your assignment" });
  }
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status: "available" },
    { new: true }
  );
  if (!table) return res.status(404).json({ message: "Not found" });

  const now = new Date();
  await Order.updateMany(
    { tableId: req.params.id, type: "dine_in", ...activeOrderFilter },
    { deletedAt: now, callWaiter: false }
  );

  emitTableCleared(String(req.params.id));
  res.json(table);
});

router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await Table.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
