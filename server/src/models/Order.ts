import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "delivering"
  | "delivered"
  | "cancelled";

export type OrderType = "dine_in" | "delivery";
export type PaymentMethod = "cash" | "paymob";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: { en: string; ar: string };
  price: number;
  quantity: number;
  notes?: string;
  addons: { name: { en: string; ar: string }; price: number }[];
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  tableId?: mongoose.Types.ObjectId;
  tableNumber?: number;
  type: OrderType;
  items: IOrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  driverId?: mongoose.Types.ObjectId;
  notes?: string;
  callWaiter: boolean;
  branchId?: mongoose.Types.ObjectId;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  name: { en: String, ar: String },
  price: Number,
  quantity: Number,
  notes: String,
  addons: [{ name: { en: String, ar: String }, price: Number }],
  subtotal: Number,
});

const orderSchema = new Schema<IOrder>(
  {
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
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ tableId: 1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
