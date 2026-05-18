import { Router } from "express";
import { Settings } from "../models/Settings.js";
import { Branch } from "../models/Branch.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
});

router.patch("/", auth, requireRole("admin"), async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create(req.body);
  else Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});

router.get("/branches", async (_req, res) => {
  const branches = await Branch.find({ isActive: true });
  res.json(branches);
});

router.get("/branches/all", auth, requireRole("admin"), async (_req, res) => {
  const branches = await Branch.find();
  res.json(branches);
});

router.post("/branches", auth, requireRole("admin"), async (req, res) => {
  const branch = await Branch.create(req.body);
  res.status(201).json(branch);
});

router.patch("/branches/:id", auth, requireRole("admin"), async (req, res) => {
  const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(branch);
});

export default router;
