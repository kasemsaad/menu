import { Order } from "../models/Order.js";
import { Settings } from "../models/Settings.js";
import { Table } from "../models/Table.js";
import { activeOrderFilter } from "./orderQuery.js";
const BILLABLE_STATUSES = ["pending", "preparing", "ready", "served"];
export const buildTableCheck = async (tableId) => {
    const table = await Table.findById(tableId);
    if (!table)
        return null;
    const settings = (await Settings.findOne()) || { servicePercent: 15 };
    const servicePercent = settings.servicePercent ?? 15;
    const orders = await Order.find({
        tableId,
        type: "dine_in",
        ...activeOrderFilter,
        status: { $in: BILLABLE_STATUSES },
    })
        .sort({ createdAt: 1 })
        .lean();
    const subtotal = orders.reduce((s, o) => s + o.subtotal, 0);
    const discount = orders.reduce((s, o) => s + o.discount, 0);
    const tax = orders.reduce((s, o) => s + o.tax, 0);
    const ordersTotal = orders.reduce((s, o) => s + o.total, 0);
    const preService = subtotal - discount + tax;
    const serviceCharge = Math.round(preService * servicePercent) / 100;
    const grandTotal = Math.round((preService + serviceCharge) * 100) / 100;
    return {
        tableId: table.id,
        tableNumber: table.number,
        servicePercent,
        orderCount: orders.length,
        orders,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        ordersTotal: Math.round(ordersTotal * 100) / 100,
        preService: Math.round(preService * 100) / 100,
        serviceCharge,
        grandTotal,
    };
};
