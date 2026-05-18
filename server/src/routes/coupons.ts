import { Router } from "express";
import { Coupon } from "../models/Coupon.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/validate", async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({
    code: code?.toUpperCase(),
    isActive: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
  });
  if (!coupon || coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ message: "Invalid coupon" });
  }
  if (subtotal < coupon.minOrder) {
    return res.status(400).json({ message: "Minimum order not met" });
  }
  const discount =
    coupon.discountType === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  res.json({ valid: true, discount, coupon });
});

router.get("/", auth, requireRole("admin"), async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

router.post("/", auth, requireRole("admin"), async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(coupon);
});

router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
