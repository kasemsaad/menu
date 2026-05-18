import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  taxPercent: number;
  deliveryFee: number;
  currency: string;
  whatsappNumber: string;
  restaurantName: { en: string; ar: string };
  logo?: string;
  primaryColor: string;
  accentColor: string;
  openTime: string;
  closeTime: string;
  lastClosingPurgeDate?: string;
  notificationSounds?: {
    newOrder?: string;
    urgent?: string;
    success?: string;
    update?: string;
  };
  soundVolume: number;
}

const settingsSchema = new Schema<ISettings>(
  {
    taxPercent: { type: Number, default: 14 },
    deliveryFee: { type: Number, default: 25 },
    currency: { type: String, default: "EGP" },
    whatsappNumber: String,
    restaurantName: {
      en: { type: String, default: "Cafe Menu" },
      ar: { type: String, default: "قائمة المقهى" },
    },
    logo: String,
    primaryColor: { type: String, default: "#ea580c" },
    accentColor: { type: String, default: "#f97316" },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "23:00" },
    lastClosingPurgeDate: String,
    notificationSounds: {
      newOrder: String,
      urgent: String,
      success: String,
      update: String,
    },
    soundVolume: { type: Number, default: 0.85, min: 0, max: 1 },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
