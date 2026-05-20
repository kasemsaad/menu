import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { notifyWaitersForTable } from "../utils/notifyStaff.js";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ,
      methods: ["GET", "POST", "PATCH"],
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join:role", (role: string) => {
      socket.join(`role:${role}`);
    });
    socket.on("join:staff", (userId: string) => {
      if (userId) socket.join(`staff:${userId}`);
    });
    socket.on("join:table", (tableId: string) => {
      socket.join(`table:${tableId}`);
    });
    socket.on("join:order", (orderId: string) => {
      socket.join(`order:${orderId}`);
    });
  });

  return io;
};

export const getIO = () => io;

/** Admin + legacy role broadcasts */
export const emitNotification = (role: string, payload: unknown) => {
  if (!io) return;
  io.to(`role:${role}`).emit("notification", payload);
};

/** Waiter alerts scoped to on-shift staff assigned to the order's table */
export const emitWaiterTableNotification = async (
  tableId: string | null,
  payload: unknown
) => {
  await notifyWaitersForTable(tableId, payload);
};

export const emitOrderRoomNotification = (orderId: string, payload: unknown) => {
  if (!io) return;
  io.to(`order:${orderId}`).emit("notification", payload);
};

/** Guest table session: orders cleared after waiter resets table */
export const emitTableCleared = (tableId: string) => {
  if (!io) return;
  io.to(`table:${tableId}`).emit("table:cleared", { tableId });
};
