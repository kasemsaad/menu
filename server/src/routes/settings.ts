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
  const {
    taxPercent,
    servicePercent,
    deliveryFee,
    whatsappNumber,
    restaurantName,
    logo,
    primaryColor,
    accentColor,
    openTime,
    closeTime,
    notificationSounds,
    soundVolume,
  } = req.body;

  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  if (taxPercent !== undefined) settings.taxPercent = taxPercent;
  if (servicePercent !== undefined) settings.servicePercent = servicePercent;
  if (deliveryFee !== undefined) settings.deliveryFee = deliveryFee;
  if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
  if (restaurantName !== undefined) settings.restaurantName = restaurantName;
  if (logo !== undefined) settings.logo = logo;
  if (primaryColor !== undefined) settings.primaryColor = primaryColor;
  if (accentColor !== undefined) settings.accentColor = accentColor;
  if (openTime !== undefined) settings.openTime = openTime;
  if (closeTime !== undefined) settings.closeTime = closeTime;
  if (notificationSounds !== undefined) settings.notificationSounds = notificationSounds;
  if (soundVolume !== undefined) settings.soundVolume = soundVolume;

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
