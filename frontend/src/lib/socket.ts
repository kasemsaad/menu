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

let echoInstance: Echo<any> | null = null;

function getEcho(): Echo<any> {
  if (!echoInstance) {
    // ✅ استخدم Pusher بدلاً من Reverb
    echoInstance = new Echo({
      broadcaster: "pusher",
      key: import.meta.env.VITE_PUSHER_APP_KEY ?? "4f14ec6b2a300873d5c4",
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "eu",
      forceTLS: true,
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

/** Socket.IO-compatible adapter over Laravel Echo + Pusher */
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