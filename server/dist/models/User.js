import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
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
    onShift: { type: Boolean, default: false },
    shiftStartedAt: Date,
    assignedTableIds: [{ type: Schema.Types.ObjectId, ref: "Table" }],
}, { timestamps: true });
export const User = mongoose.model("User", userSchema);
