import { Router } from "express";
import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import { auth, requireRole } from "../middleware/auth.js";
import { syncProductRating } from "../utils/productRating.js";

const router = Router();

router.get("/", auth, requireRole("admin"), async (_req, res) => {
  const reviews = await Review.find()
    .populate("productId", "name")
    .sort({ createdAt: -1 })
    .limit(500);
  res.json(reviews);
});

router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const { rating, comment, tableNumber } = req.body;
  const update: Record<string, unknown> = {};
  if (rating !== undefined) {
    const r = Number(rating);
    if (r < 1 || r > 5) return res.status(400).json({ message: "Rating must be 1–5" });
    update.rating = r;
  }
  if (comment !== undefined) update.comment = comment;
  if (tableNumber !== undefined) update.tableNumber = tableNumber === "" ? undefined : Number(tableNumber);

  const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true }).populate(
    "productId",
    "name"
  );
  if (!review) return res.status(404).json({ message: "Not found" });

  await syncProductRating(review.productId.toString());
  res.json(review);
});

router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: "Not found" });

  await syncProductRating(review.productId.toString());
  res.json({ message: "Deleted" });
});

export default router;
