import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(url, { transports: ["websocket", "polling"] });
  }
  return socket;
};

export const joinRole = (role: string) => {
  getSocket().emit("join:role", role);
};

export const joinStaff = (userId: string) => {
  getSocket().emit("join:staff", userId);
};

export const joinTable = (tableId: string) => {
  getSocket().emit("join:table", tableId);
};

export const joinOrder = (orderId: string) => {
  getSocket().emit("join:order", orderId);
};
