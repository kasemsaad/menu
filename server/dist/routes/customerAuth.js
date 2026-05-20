import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Customer } from "../models/Customer.js";
import { customerAuth } from "../middleware/customerAuth.js";
const router = Router();
router.post("/register", async (req, res) => {
    const { name, email, password, phone, address, deliveryLat, deliveryLng } = req.body;
    if (!name || !email || !password || !phone || !address) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const exists = await Customer.findOne({ email: email.toLowerCase() });
    if (exists)
        return res.status(400).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
        name,
        email: email.toLowerCase(),
        password: hashed,
        phone,
        address,
        deliveryLat,
        deliveryLng,
    });
    const token = jwt.sign({ id: customer.id, role: "customer" }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });
    res.status(201).json({
        token,
        user: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            deliveryLat: customer.deliveryLat,
            deliveryLng: customer.deliveryLng,
            role: "customer",
        },
    });
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email: email?.toLowerCase(), isActive: true });
    if (!customer || !(await bcrypt.compare(password, customer.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: customer.id, role: "customer" }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });
    res.json({
        token,
        user: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            deliveryLat: customer.deliveryLat,
            deliveryLng: customer.deliveryLng,
            role: "customer",
        },
    });
});
router.get("/me", customerAuth, async (req, res) => {
    const customer = await Customer.findById(req.customer.id).select("-password");
    if (!customer)
        return res.status(404).json({ message: "Not found" });
    res.json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        deliveryLat: customer.deliveryLat,
        deliveryLng: customer.deliveryLng,
        role: "customer",
    });
});
router.patch("/me", customerAuth, async (req, res) => {
    const { name, phone, address, deliveryLat, deliveryLng, password } = req.body;
    const update = {};
    if (name)
        update.name = name;
    if (phone)
        update.phone = phone;
    if (address)
        update.address = address;
    if (deliveryLat !== undefined)
        update.deliveryLat = deliveryLat;
    if (deliveryLng !== undefined)
        update.deliveryLng = deliveryLng;
    if (password)
        update.password = await bcrypt.hash(password, 10);
    const customer = await Customer.findByIdAndUpdate(req.customer.id, update, { new: true }).select("-password");
    res.json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        deliveryLat: customer.deliveryLat,
        deliveryLng: customer.deliveryLng,
        role: "customer",
    });
});
export default router;
