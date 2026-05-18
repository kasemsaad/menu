import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { auth, AuthRequest } from "../middleware/auth.js";
import customerAuthRoutes from "./customerAuth.js";

const router = Router();

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
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    },
  });
});

router.get("/me", auth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).select("-password");
  res.json(user);
});

export default router;
