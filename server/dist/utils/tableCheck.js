import { Order } from "../models/Order.js";
import { Settings } from "../models/Settings.js";
import { Table } from "../models/Table.js";
import { activeOrderFilter } from "./orderQuery.js";
const BILLABLE_STATUSES = ["pending", "preparing", "ready", "served"];
export const buildTableCheck = async (tableId) => {
    const table = await Table.findById(tableId);
    if (!table)
        return null;
    const settings = (await Settings.findOne()) || { servicePercent: 15, taxPercent: 14 };
    const servicePercent = settings.servicePercent ?? 15;
    const taxPercent = settings.taxPercent ?? 14;
    const orders = await Order.find({
        tableId,
        type: "dine_in",
        ...activeOrderFilter,
        status: { $in: BILLABLE_STATUSES },
    })
        .sort({ createdAt: 1 })
        .lean();
    const round = (value) => Math.round(value * 100) / 100;
    const subtotal = round(orders.reduce((s, o) => s + o.subtotal, 0));
    const discount = round(orders.reduce((s, o) => s + o.discount, 0));
    const ordersTotal = round(orders.reduce((s, o) => s + o.total, 0));
    const preTax = round(subtotal - discount);
    const tax = round((preTax * taxPercent) / 100);
    const preService = round(preTax + tax);
    const serviceCharge = round((preTax * servicePercent) / 100);
    const grandTotal = round(preTax + tax + serviceCharge);
    return {
        tableId: table.id,
        tableNumber: table.number,
        servicePercent,
        orderCount: orders.length,
        orders,
        subtotal,
        discount,
        tax,
        ordersTotal,
        preService,
        serviceCharge,
        grandTotal,
    };
};
