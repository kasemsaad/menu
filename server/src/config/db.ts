import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI as string;

  await mongoose.connect(uri);

  console.log("✅ MongoDB connected");
};