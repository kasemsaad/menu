import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  taxPercent: number;
  deliveryFee: number;
  currency: string;
  whatsappNumber: string;
  restaurantName: { en: string; ar: string };
  logo?: string;
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
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
