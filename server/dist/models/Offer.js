import mongoose, { Schema } from "mongoose";
const offerSchema = new Schema({
    title: { en: { type: String, required: true }, ar: { type: String, required: true } },
    description: { en: String, ar: String },
    image: String,
    discountPercent: { type: Number, default: 10 },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Offer = mongoose.model("Offer", offerSchema);
