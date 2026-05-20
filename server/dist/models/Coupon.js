import mongoose, { Schema } from "mongoose";
const couponSchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    maxUses: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Coupon = mongoose.model("Coupon", couponSchema);
