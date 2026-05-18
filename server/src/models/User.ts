import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "chef" | "waiter" | "delivery";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: mongoose.Types.ObjectId;
  phone?: string;
  isActive: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "chef", "waiter", "delivery"],
      required: true,
    },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    phone: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
