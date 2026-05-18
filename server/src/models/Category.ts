import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: { en: String, ar: String },
    image: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>("Category", categorySchema);
