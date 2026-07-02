import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (...args: any[]) => void;

const REALTIME_EVENTS = ["notification", "order:new", "order:updated", "table:cleared"] as const;
const handlers = new Map<string, Set<EventHandler>>();
const subscribedChannels = new Set<string>();

let echoInstance: Echo<"reverb"> | null = null;

function getEcho(): Echo<"reverb"> {
  if (!echoInstance) {
    const scheme = import.meta.env.VITE_REVERB_SCHEME ?? "http";
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: import.meta.env.VITE_REVERB_APP_KEY ?? "restaurant-menu-key",
      wsHost: import.meta.env.VITE_REVERB_HOST ?? "127.0.0.1",
      wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
      forceTLS: scheme === "https",
      enabledTransports: ["ws", "wss"],
      disableStats: true,
    });
  }
  return echoInstance;
}

function dispatch(event: string, payload: unknown) {
  handlers.get(event)?.forEach((handler) => handler(payload));
}

function subscribeChannel(channelName: string) {
  if (subscribedChannels.has(channelName)) return;
  subscribedChannels.add(channelName);

  const channel = getEcho().channel(channelName);
  for (const event of REALTIME_EVENTS) {
    channel.listen(`.${event}`, (payload: unknown) => dispatch(event, payload));
  }
}

export const joinRole = (role: string) => subscribeChannel(`role.${role}`);
export const joinStaff = (userId: string) => subscribeChannel(`staff.${userId}`);
export const joinTable = (tableId: string) => subscribeChannel(`table.${tableId}`);
export const joinOrder = (orderId: string) => subscribeChannel(`order.${orderId}`);

/** Socket.IO-compatible adapter over Laravel Reverb + Echo */
export const getSocket = () => ({
  on(event: string, handler: EventHandler) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
  },
  off(event: string, handler: EventHandler) {
    handlers.get(event)?.delete(handler);
  },
  emit() {
    /* channel joins use joinRole/joinStaff/joinTable/joinOrder */
  },
});
