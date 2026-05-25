import { Router } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Offer } from "../models/Offer.js";
import { Coupon } from "../models/Coupon.js";
import { User } from "../models/User.js";
import { Table } from "../models/Table.js";
import { auth, requireRole } from "../middleware/auth.js";
import { activeOrderFilter } from "../utils/orderQuery.js";

const router = Router();

router.get("/dashboard", auth, requireRole("admin"), async (req, res) => {
  const { period = "7d" } = req.query;
  const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const now = new Date();
  const [orders, productCount, categoryCount, offerCount, couponCount, tableCount, userCount, recentOrders, activeOffers, recentProducts] = await Promise.all([
    Order.find({
      ...activeOrderFilter,
      createdAt: { $gte: start },
      status: { $nin: ["cancelled"] },
    }),
    Product.countDocuments(),
    Category.countDocuments(),
    Offer.countDocuments(),
    Coupon.countDocuments(),
    Table.countDocuments(),
    User.countDocuments(),
    Order.find(activeOrderFilter).sort({ createdAt: -1 }).limit(5),
    Offer.find({
      isActive: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    }).sort({ createdAt: -1 }).limit(5),
    Product.find().sort({ createdAt: -1 }).limit(5),
  ]);

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const orderCount = orders.length;
  const avgOrder = orderCount ? revenue / orderCount : 0;

  const dailyMap = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { date: key, revenue: 0, orders: 0 });
  }
  orders.forEach((o) => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      entry.revenue += o.total;
      entry.orders += 1;
    }
  });

  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const key = item.productId?.toString() || item.name.en;
      const existing = productSales.get(key) || {
        name: item.name.en,
        qty: 0,
        revenue: 0,
      };
      existing.qty += item.quantity;
      existing.revenue += item.subtotal;
      productSales.set(key, existing);
    });
  });

  const topProducts = [...productSales.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  const hourMap = Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0 }));
  orders.forEach((o) => {
    const h = new Date(o.createdAt).getHours();
    hourMap[h].orders += 1;
  });

  const deliveryOrders = orders.filter((o) => o.type === "delivery");
  const dineInOrders = orders.filter((o) => o.type === "dine_in");

  res.json({
    summary: { revenue, orderCount, avgOrder, deliveryCount: deliveryOrders.length },
    dailySales: [...dailyMap.values()],
    topProducts,
    peakHours: hourMap,
    orderTypes: [
      { name: "Dine In", value: dineInOrders.length },
      { name: "Delivery", value: deliveryOrders.length },
    ],
    resourceCounts: {
      products: productCount,
      categories: categoryCount,
      offers: offerCount,
      coupons: couponCount,
      tables: tableCount,
      users: userCount,
    },
    recentOrders: recentOrders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      total: order.total,
      createdAt: order.createdAt,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
    })),
    activeOffers: activeOffers.map((offer) => ({
      _id: offer._id,
      title: offer.title,
      discountPercent: offer.discountPercent,
      startsAt: offer.startsAt,
      endsAt: offer.endsAt,
      isActive: offer.isActive,
    })),
    recentProducts: recentProducts.map((product) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
    })),
  });
});

router.get("/staff/performance", auth, requireRole("admin"), async (_req, res) => {
  const days = 7;
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const orders = await Order.find({
    ...activeOrderFilter,
    status: { $nin: ["cancelled"] },
    createdAt: { $gte: start },
  }).populate("tableId", "number");

  // Group by status transitions for time tracking
  const chefMetrics = {
    totalOrders: 0,
    avgPrepTime: 0,
    completedOrders: 0,
  };
  const waiterMetrics = {
    totalOrders: 0,
    avgWaitTime: 0,
    completedOrders: 0,
  };

  let totalPrepTime = 0;
  let prepTimeCount = 0;
  let totalWaitTime = 0;
  let waitTimeCount = 0;

  orders.forEach((order) => {
    if (order.status === "ready" || order.status === "served") {
      chefMetrics.completedOrders++;
      const prepTime = new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime();
      totalPrepTime += prepTime;
      prepTimeCount++;
    }

    if (order.status === "served" || order.status === "delivered") {
      waiterMetrics.completedOrders++;
      const waitTime = new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime();
      totalWaitTime += waitTime;
      waitTimeCount++;
    }
  });

  chefMetrics.totalOrders = orders.filter((o) => ["preparing", "ready", "served"].includes(o.status)).length;
  chefMetrics.avgPrepTime = prepTimeCount > 0 ? Math.round(totalPrepTime / prepTimeCount / 60000) : 0; // minutes

  waiterMetrics.totalOrders = orders.length;
  waiterMetrics.avgWaitTime = waitTimeCount > 0 ? Math.round(totalWaitTime / waitTimeCount / 60000) : 0; // minutes

  const userMetrics: Record<string, any> = {};
  const users = await User.find({ isActive: true });
  for (const user of users) {
    const userOrders = orders.filter(
      (o) =>
        (user.role === "chef" && ["preparing", "ready"].includes(o.status)) ||
        (user.role === "waiter" && ["served", "delivering"].includes(o.status))
    );
    userMetrics[user.id] = {
      name: user.name,
      role: user.role,
      ordersHandled: userOrders.length,
      avgTime: userOrders.length > 0 ? Math.round(userOrders.reduce((s, o) => s + (o.updatedAt.getTime() - o.createdAt.getTime()), 0) / userOrders.length / 60000) : 0,
    };
  }

  res.json({
    period: `${days}d`,
    chefMetrics,
    waiterMetrics,
    userMetrics,
  });
});

router.post("/reset", auth, requireRole("admin"), async (_req, res) => {
  // Soft delete all old orders (not from today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await Order.updateMany(
    { createdAt: { $lt: today } },
    { deletedAt: new Date() }
  );

  res.json({
    message: "Analytics reset - old orders archived",
    archivedCount: result.modifiedCount,
  });
});

export default router;

