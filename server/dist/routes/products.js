import { Router } from "express";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { auth, requireRole } from "../middleware/auth.js";
import { syncProductRating } from "../utils/productRating.js";
const router = Router();
router.get("/all", auth, requireRole("admin"), async (_req, res) => {
    const products = await Product.find().populate("categoryId", "name");
    res.json(products);
});
router.get("/", async (req, res) => {
    const filter = { isAvailable: true };
    if (req.query.categoryId)
        filter.categoryId = req.query.categoryId;
    if (req.query.search) {
        const s = String(req.query.search);
        filter.$or = [
            { "name.en": { $regex: s, $options: "i" } },
            { "name.ar": { $regex: s, $options: "i" } },
        ];
    }
    const products = await Product.find(filter).populate("categoryId", "name");
    res.json(products);
});
router.get("/featured", async (_req, res) => {
    const products = await Product.find({ isAvailable: true, isFeatured: true }).limit(8);
    res.json(products);
});
router.get("/:id", async (req, res) => {
    const product = await Product.findById(req.params.id).populate("categoryId", "name");
    if (!product)
        return res.status(404).json({ message: "Not found" });
    res.json(product);
});
router.post("/", auth, requireRole("admin"), async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json(product);
});
router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
});
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});
router.post("/:id/reviews", async (req, res) => {
    const { rating, comment, tableNumber } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product)
        return res.status(404).json({ message: "Not found" });
    await Review.create({ productId: product.id, rating, comment, tableNumber });
    await syncProductRating(product.id);
    const updated = await Product.findById(product.id);
    res.status(201).json({ rating: updated?.rating ?? 0, ratingCount: updated?.ratingCount ?? 0 });
});
export default router;
