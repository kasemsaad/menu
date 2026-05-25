import { Schema, model } from "mongoose";

const LocalizedSchema = new Schema(
  {
    en: { type: String },
    ar: { type: String },
  },
  { _id: false }
);

const BannerSchema = new Schema(
  {
    title: { type: LocalizedSchema, required: true },
    subtitle: { type: LocalizedSchema },
    description: { type: LocalizedSchema },
    image: { type: String }, // data URL or URL
    buttonText: { type: LocalizedSchema },
    buttonLink: { type: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

export const Banner = model("Banner", BannerSchema);
