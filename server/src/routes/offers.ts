import { Router } from "express";
import { Offer } from "../models/Offer.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const now = new Date();
  const offers = await Offer.find({
    isActive: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).populate("productIds", "name price image");
  res.json(offers);
});

router.get("/all", auth, requireRole("admin"), async (_req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });
  res.json(offers);
});

router.post("/", auth, requireRole("admin"), async (req, res) => {
  const offer = await Offer.create(req.body);
  res.status(201).json(offer);
});

router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(offer);
});

router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await Offer.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
