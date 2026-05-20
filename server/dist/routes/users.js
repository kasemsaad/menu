import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { auth, requireRole } from "../middleware/auth.js";
const router = Router();
router.get("/", auth, requireRole("admin"), async (_req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
});
router.post("/", auth, requireRole("admin"), async (req, res) => {
    const { password, ...rest } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ ...rest, password: hashed });
    const { password: _, ...safe } = user.toObject();
    res.status(201).json(safe);
});
router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
    const update = { ...req.body };
    if (update.password) {
        update.password = await bcrypt.hash(update.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
    res.json(user);
});
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});
export default router;
