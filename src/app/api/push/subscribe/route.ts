import { NextResponse } from 'next/server';
import { db } from '@/db';
import { push_subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { subscription, parentId } = await req.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Ongeldige subscription' }, { status: 400 });
    }

    await db
      .insert(push_subscriptions)
      .values({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        parent_id: parentId ?? null,
      })
      .onConflictDoUpdate({
        target: push_subscriptions.endpoint,
        set: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          parent_id: parentId ?? null,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { endpoint } = await req.json();
    await db.delete(push_subscriptions).where(eq(push_subscriptions.endpoint, endpoint));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
