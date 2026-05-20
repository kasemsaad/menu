import { Server } from "socket.io";
import { notifyWaitersForTable } from "../utils/notifyStaff.js";
let io;
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST", "PATCH"],
        },
    });
    io.on("connection", (socket) => {
        socket.on("join:role", (role) => {
            socket.join(`role:${role}`);
        });
        socket.on("join:staff", (userId) => {
            if (userId)
                socket.join(`staff:${userId}`);
        });
        socket.on("join:table", (tableId) => {
            socket.join(`table:${tableId}`);
        });
        socket.on("join:order", (orderId) => {
            socket.join(`order:${orderId}`);
        });
    });
    return io;
};
export const getIO = () => io;
/** Admin + legacy role broadcasts */
export const emitNotification = (role, payload) => {
    if (!io)
        return;
    io.to(`role:${role}`).emit("notification", payload);
};
/** Waiter alerts scoped to on-shift staff assigned to the order's table */
export const emitWaiterTableNotification = async (tableId, payload) => {
    await notifyWaitersForTable(tableId, payload);
};
export const emitOrderRoomNotification = (orderId, payload) => {
    if (!io)
        return;
    io.to(`order:${orderId}`).emit("notification", payload);
};
/** Guest table session: orders cleared after waiter resets table */
export const emitTableCleared = (tableId) => {
    if (!io)
        return;
    io.to(`table:${tableId}`).emit("table:cleared", { tableId });
};
