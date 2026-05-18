import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  name: { en: string; ar: string };
  address: { en: string; ar: string };
  phone: string;
  lat?: number;
  lng?: number;
  isActive: boolean;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { en: { type: String, required: true }, ar: { type: String, required: true } },
    address: { en: String, ar: String },
    phone: String,
    lat: Number,
    lng: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Branch = mongoose.model<IBranch>("Branch", branchSchema);
