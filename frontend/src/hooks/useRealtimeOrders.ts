import { useEffect } from "react";
import { getSocket, joinRole, joinStaff } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@/types";

/** Subscribe to socket order events and refresh dashboard lists. */
export const useRealtimeOrders = (
  onRefresh: () => void,
  options?: { onNewOrder?: (order: Order) => void }
) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    joinRole(user.role);
    joinStaff(user.id);
    const socket = getSocket();
    const refresh = () => onRefresh();

    socket.on("order:updated", refresh);
    socket.on("notification", refresh);

    if (options?.onNewOrder) {
      socket.on("order:new", options.onNewOrder);
    } else {
      socket.on("order:new", refresh);
    }

    return () => {
      socket.off("order:updated", refresh);
      socket.off("notification", refresh);
      if (options?.onNewOrder) socket.off("order:new", options.onNewOrder);
      else socket.off("order:new", refresh);
    };
  }, [user, onRefresh, options?.onNewOrder]);
};
