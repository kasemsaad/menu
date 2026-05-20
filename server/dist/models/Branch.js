import mongoose, { Schema } from "mongoose";
const branchSchema = new Schema({
    name: { en: { type: String, required: true }, ar: { type: String, required: true } },
    address: { en: String, ar: String },
    phone: String,
    lat: Number,
    lng: Number,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Branch = mongoose.model("Branch", branchSchema);
