import { Router } from "express";
import { Category } from "../models/Category.js";
import { auth, requireRole } from "../middleware/auth.js";
const router = Router();
router.get("/", async (_req, res) => {
    const categories = await Category.find({ isActive: true }).sort("sortOrder");
    res.json(categories);
});
router.get("/all", auth, requireRole("admin"), async (_req, res) => {
    const categories = await Category.find().sort("sortOrder");
    res.json(categories);
});
router.post("/", auth, requireRole("admin"), async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).json(category);
});
router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
});
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});
export default router;
