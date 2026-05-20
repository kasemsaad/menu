import mongoose, { Schema } from "mongoose";
const orderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { en: String, ar: String },
    price: Number,
    quantity: Number,
    notes: String,
    addons: [{ name: { en: String, ar: String }, price: Number }],
    subtotal: Number,
});
const orderSchema = new Schema({
    orderNumber: { type: String, required: true, unique: true },
    tableId: { type: Schema.Types.ObjectId, ref: "Table" },
    tableNumber: Number,
    type: { type: String, enum: ["dine_in", "delivery"], default: "dine_in" },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ["pending", "preparing", "ready", "served", "delivering", "delivered", "cancelled"],
        default: "pending",
    },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["cash", "paymob"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    couponCode: String,
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: String,
    customerPhone: String,
    deliveryAddress: String,
    deliveryLat: Number,
    deliveryLng: Number,
    driverId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String,
    callWaiter: { type: Boolean, default: false },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ tableId: 1 });
orderSchema.index({ deletedAt: 1 });
export const Order = mongoose.model("Order", orderSchema);
