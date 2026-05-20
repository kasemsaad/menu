import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";

export const syncProductRating = async (productId: string) => {
  const reviews = await Review.find({ productId });
  const product = await Product.findById(productId);
  if (!product) return;
  if (!reviews.length) {
    product.rating = 0;
    product.ratingCount = 0;
  } else {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    product.rating = Math.round(avg * 10) / 10;
    product.ratingCount = reviews.length;
  }
  await product.save();
};
