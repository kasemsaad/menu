import { Router } from "express";
import bcrypt from "bcryptjs";
import { Customer } from "../models/Customer.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, requireRole("admin"), async (_req, res) => {
  const customers = await Customer.find().select("-password").sort({ createdAt: -1 });
  res.json(
    customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      deliveryLat: customer.deliveryLat,
      deliveryLng: customer.deliveryLng,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }))
  );
});

router.post("/", auth, requireRole("admin"), async (req, res) => {
  const { name, email, password, phone, address, deliveryLat, deliveryLng, isActive } = req.body;
  if (!name || !email || !password || !phone || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await Customer.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const customer = await Customer.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    phone,
    address,
    deliveryLat,
    deliveryLng,
    isActive: isActive ?? true,
  });

  res.status(201).json({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    deliveryLat: customer.deliveryLat,
    deliveryLng: customer.deliveryLng,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  });
});

router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  const { name, email, phone, address, deliveryLat, deliveryLng, password, isActive } = req.body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = (email as string).toLowerCase();
  if (phone !== undefined) update.phone = phone;
  if (address !== undefined) update.address = address;
  if (deliveryLat !== undefined) update.deliveryLat = deliveryLat;
  if (deliveryLng !== undefined) update.deliveryLng = deliveryLng;
  if (isActive !== undefined) update.isActive = isActive;
  if (password) update.password = await bcrypt.hash(password, 10);

  const customer = await Customer.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  res.json({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    deliveryLat: customer.deliveryLat,
    deliveryLng: customer.deliveryLng,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  });
});

router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
