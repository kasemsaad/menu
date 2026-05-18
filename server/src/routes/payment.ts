import { Router } from "express";
import { Order } from "../models/Order.js";

const router = Router();

/** Paymob placeholder — integrate with Paymob API using env keys */
router.post("/paymob/initiate", async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const apiKey = process.env.PAYMOB_API_KEY;
  if (!apiKey) {
    return res.json({
      mock: true,
      message: "Configure PAYMOB_API_KEY for live payments",
      paymentUrl: `${process.env.CLIENT_URL}/order/${orderId}?paid=mock`,
      orderId: order.id,
    });
  }

  // Production: call Paymob auth + order + payment key APIs
  res.json({
    paymentUrl: `${process.env.CLIENT_URL}/order/${orderId}`,
    orderId: order.id,
  });
});

router.post("/paymob/webhook", async (req, res) => {
  const { orderId, success } = req.body;
  if (success && orderId) {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      paymentMethod: "paymob",
    });
  }
  res.json({ received: true });
});

export default router;
