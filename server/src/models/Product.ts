import mongoose, { Schema, Document } from "mongoose";

export interface IAddon {
  name: { en: string; ar: string };
  price: number;
}

export interface IProduct extends Document {
  categoryId: mongoose.Types.ObjectId;
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  price: number;
  image?: string;
  addons: IAddon[];
  isAvailable: boolean;
  isFeatured: boolean;
  rating: number;
  ratingCount: number;
  prepTimeMinutes: number;
}

const addonSchema = new Schema<IAddon>({
  name: { en: String, ar: String },
  price: { type: Number, default: 0 },
});

const productSchema = new Schema<IProduct>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: { en: String, ar: String },
    price: { type: Number, required: true },
    image: String,
    addons: [addonSchema],
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    prepTimeMinutes: { type: Number, default: 15 },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
