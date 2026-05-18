import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, UserRole } from "../models/User.js";
import { auth, AuthRequest } from "../middleware/auth.js";
import customerAuthRoutes from "./customerAuth.js";

const router = Router();

const serializeStaff = (user: InstanceType<typeof User>) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  branchId: user.branchId,
  onShift: user.onShift ?? false,
  shiftStartedAt: user.shiftStartedAt,
  assignedTableIds: (user.assignedTableIds ?? []).map((id) => id.toString()),
});

const shiftRoles: UserRole[] = ["chef", "waiter"];

router.use("/customer", customerAuthRoutes);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role, branchId: user.branchId },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );
  res.json({
    token,
    user: serializeStaff(user),
  });
});

router.get("/me", auth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).select("-password");
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json({
    _id: user.id,
    ...serializeStaff(user),
  });
});

router.post("/shift/start", auth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user || !shiftRoles.includes(user.role)) {
    return res.status(403).json({ message: "Shift not available for this role" });
  }
  if (user.role === "waiter") {
    const tableIds: string[] = req.body.tableIds ?? [];
    if (!tableIds.length) {
      return res.status(400).json({ message: "Select at least one table" });
    }
    const valid = tableIds.every((id) => mongoose.isValidObjectId(id));
    if (!valid) return res.status(400).json({ message: "Invalid table id" });
    user.assignedTableIds = tableIds.map((id) => new mongoose.Types.ObjectId(id));
  }
  user.onShift = true;
  user.shiftStartedAt = new Date();
  await user.save();
  res.json(serializeStaff(user));
});

router.post("/shift/end", auth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user || !shiftRoles.includes(user.role)) {
    return res.status(403).json({ message: "Shift not available for this role" });
  }
  user.onShift = false;
  user.shiftStartedAt = undefined;
  user.assignedTableIds = [];
  await user.save();
  res.json(serializeStaff(user));
});

router.patch("/shift/tables", auth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user || user.role !== "waiter") {
    return res.status(403).json({ message: "Only waiters can assign tables" });
  }
  if (!user.onShift) {
    return res.status(400).json({ message: "Start shift before updating tables" });
  }
  const tableIds: string[] = req.body.tableIds ?? [];
  if (!tableIds.length) {
    return res.status(400).json({ message: "Select at least one table" });
  }
  const valid = tableIds.every((id) => mongoose.isValidObjectId(id));
  if (!valid) return res.status(400).json({ message: "Invalid table id" });
  user.assignedTableIds = tableIds.map((id) => new mongoose.Types.ObjectId(id));
  await user.save();
  res.json(serializeStaff(user));
});

export default router;
