import { Router } from "express";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { Table } from "../models/Table.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();
const clientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

router.get("/", auth, requireRole("admin", "waiter"), async (_req, res) => {
  const tables = await Table.find().sort("number");
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

router.patch("/:id/status", auth, requireRole("admin", "waiter"), async (req, res) => {
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(table);
});

router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await Table.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
