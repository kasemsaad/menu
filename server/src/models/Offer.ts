import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  title: { en: string; ar: string };
  description?: { en: string; ar: string };
  image?: string;
  discountPercent: number;
  productIds: mongoose.Types.ObjectId[];
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { en: { type: String, required: true }, ar: { type: String, required: true } },
    description: { en: String, ar: String },
    image: String,
    discountPercent: { type: Number, default: 10 },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>("Offer", offerSchema);
