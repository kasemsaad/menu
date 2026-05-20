import { Router } from "express";
import { Order } from "../models/Order.js";
import { auth, requireRole } from "../middleware/auth.js";
import { activeOrderFilter } from "../utils/orderQuery.js";
const router = Router();
router.get("/dashboard", auth, requireRole("admin"), async (req, res) => {
    const { period = "7d" } = req.query;
    const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    const orders = await Order.find({
        ...activeOrderFilter,
        createdAt: { $gte: start },
        status: { $nin: ["cancelled"] },
    });
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const orderCount = orders.length;
    const avgOrder = orderCount ? revenue / orderCount : 0;
    const dailyMap = new Map();
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
    const productSales = new Map();
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
    });
});
export default router;
