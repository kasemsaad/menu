import mongoose, { Schema } from "mongoose";
const addonSchema = new Schema({
    name: { en: String, ar: String },
    price: { type: Number, default: 0 },
});
const productSchema = new Schema({
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
}, { timestamps: true });
export const Product = mongoose.model("Product", productSchema);
