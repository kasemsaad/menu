import mongoose, { Schema } from "mongoose";
const tableSchema = new Schema({
    number: { type: Number, required: true, unique: true },
    qrCode: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 4 },
    status: {
        type: String,
        enum: ["available", "occupied", "needs_bill"],
        default: "available",
    },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
}, { timestamps: true });
export const Table = mongoose.model("Table", tableSchema);
