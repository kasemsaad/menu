import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket/index.js";
import { startClosingPurgeJob } from "./jobs/closingPurge.js";

import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import tableRoutes from "./routes/tables.js";
import orderRoutes from "./routes/orders.js";
import offerRoutes from "./routes/offers.js";
import couponRoutes from "./routes/coupons.js";
import userRoutes from "./routes/users.js";
import analyticsRoutes from "./routes/analytics.js";
import settingsRoutes from "./routes/settings.js";
import bannersRoutes from "./routes/banners.js";
import reviewRoutes from "./routes/reviews.js";
import paymentRoutes from "./routes/payment.js";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL ,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);

initSocket(server);

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    startClosingPurgeJob();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("\n❌ Server failed to start — is MongoDB running?");
    console.error("   Start MongoDB, then run: npm run dev");
    console.error("   URI:", process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/restaurant-menu");
    console.error(err);
    process.exit(1);
  });
