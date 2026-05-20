import mongoose, { Schema } from "mongoose";
const reviewSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    tableNumber: Number,
}, { timestamps: true });
export const Review = mongoose.model("Review", reviewSchema);
