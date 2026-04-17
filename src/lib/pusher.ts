import Pusher from "pusher";
import PusherJS from "pusher-js";

// Server-side Pusher (only instantiate when keys are present)
export const pusherServer = process.env.PUSHER_APP_ID
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
      useTLS: true,
    })
  : null;

// Client-side Pusher — returns null when keys are missing (no crash)
export const getPusherClient = (): PusherJS | null => {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  if (!key) return null;
  return new PusherJS(key, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
  });
};
