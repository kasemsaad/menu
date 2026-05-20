import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
    name: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
    },
    description: { en: String, ar: String },
    image: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Category = mongoose.model("Category", categorySchema);
