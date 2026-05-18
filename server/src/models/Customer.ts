import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  deliveryLat?: number;
  deliveryLng?: number;
  isActive: boolean;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    deliveryLat: Number,
    deliveryLng: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
