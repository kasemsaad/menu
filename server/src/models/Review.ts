import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  tableNumber?: number;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    tableNumber: Number,
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>("Review", reviewSchema);
