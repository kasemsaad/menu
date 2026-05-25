import { Router } from "express";
import { Banner } from "../models/Banner.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    $or: [
      { startsAt: { $exists: false }, endsAt: { $exists: false } },
      { startsAt: { $lte: now }, endsAt: { $gte: now } },
      { startsAt: { $lte: now }, endsAt: { $exists: false } },
    ],
  })
    .sort({ isFeatured: -1, order: 1 })
    .limit(5);
  res.json(banners);
});

router.get("/all", auth, requireRole("admin"), async (_req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
  res.json(banners);
});

router.post("/", auth, requireRole("admin"), async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json(banner);
});

router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(banner);
});

router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
