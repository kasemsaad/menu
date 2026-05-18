import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join:role", (role: string) => {
      socket.join(`role:${role}`);
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

export const emitOrderUpdate = (order: unknown) => {
  if (!io) return;
  io.to("role:chef").to("role:waiter").to("role:admin").to("role:delivery").emit("order:updated", order);
  const o = order as { _id?: string; tableId?: string };
  if (o.tableId) io.to(`table:${o.tableId}`).emit("order:updated", order);
  if (o._id) io.to(`order:${o._id}`).emit("order:updated", order);
};

export const emitNewOrder = (order: unknown) => {
  if (!io) return;
  const o = order as { type?: string };
  io.to("role:chef").to("role:admin").emit("order:new", order);
  if (o.type === "delivery") {
    io.to("role:delivery").emit("order:new", order);
  } else {
    io.to("role:waiter").emit("notification", { type: "new_order", order });
  }
};

export const emitOrderRoomNotification = (orderId: string, payload: unknown) => {
  if (!io) return;
  io.to(`order:${orderId}`).emit("notification", payload);
};

export const emitNotification = (role: string, payload: unknown) => {
  if (!io) return;
  io.to(`role:${role}`).emit("notification", payload);
};
