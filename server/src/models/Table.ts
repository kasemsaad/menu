import mongoose, { Schema, Document } from "mongoose";

export type TableStatus = "available" | "occupied" | "needs_bill";

export interface ITable extends Document {
  number: number;
  qrCode: string;
  capacity: number;
  status: TableStatus;
  branchId?: mongoose.Types.ObjectId;
}

const tableSchema = new Schema<ITable>(
  {
    number: { type: Number, required: true, unique: true },
    qrCode: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 4 },
    status: {
      type: String,
      enum: ["available", "occupied", "needs_bill"],
      default: "available",
    },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  { timestamps: true }
);

export const Table = mongoose.model<ITable>("Table", tableSchema);
