import { db } from '@/db';
import { push_subscriptions, push_log } from '@/db/schema';
import { sendToSubscription, PushPayload } from './webpush';
import { eq } from 'drizzle-orm';

export async function broadcastPush(payload: PushPayload) {
  try {
    if (!process.env.VAPID_PRIVATE_KEY) return;

    const subs = await db.select().from(push_subscriptions);
    if (subs.length === 0) return;

    const expiredIds: number[] = [];

    await Promise.all(
      subs.map(async (sub) => {
        const result = await sendToSubscription(sub, payload);
        if (result === 'expired') expiredIds.push(sub.id);
      })
    );

    if (expiredIds.length > 0) {
      await Promise.all(
        expiredIds.map((id) => db.delete(push_subscriptions).where(eq(push_subscriptions.id, id)))
      );
    }

    await db.insert(push_log).values({ title: payload.title, message: payload.body });
  } catch (err) {
    console.error('[broadcastPush]', err);
  }
}
