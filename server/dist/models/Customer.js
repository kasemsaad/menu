import mongoose, { Schema } from "mongoose";
const customerSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    deliveryLat: Number,
    deliveryLng: Number,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Customer = mongoose.model("Customer", customerSchema);
