import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { push_subscriptions, push_log } from '@/db/schema';
import { sendToSubscription } from '@/lib/webpush';
import { eq } from 'drizzle-orm';

function isAdmin() {
  const session = cookies().get('vvc_admin_session')?.value;
  return session === process.env.ADMIN_SECRET;
}

export async function POST(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const { title, message, url = '/' } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: 'title en message zijn verplicht' }, { status: 400 });
    }

    const payload = { title, body: message, url };
    const subs = await db.select().from(push_subscriptions);

    let sent = 0;
    let failed = 0;
    const expiredIds: number[] = [];

    await Promise.all(
      subs.map(async (sub) => {
        const result = await sendToSubscription(sub, payload);
        if (result === 'ok') sent++;
        else if (result === 'expired') expiredIds.push(sub.id);
        else failed++;
      })
    );

    if (expiredIds.length > 0) {
      await Promise.all(
        expiredIds.map((id) => db.delete(push_subscriptions).where(eq(push_subscriptions.id, id)))
      );
    }

    await db.insert(push_log).values({ title, message });

    return NextResponse.json({ sent, failed, expired: expiredIds.length, total: subs.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }
    const [subs, logs] = await Promise.all([
      db.select().from(push_subscriptions),
      db.select().from(push_log).orderBy(push_log.sent_at).limit(20),
    ]);
    return NextResponse.json({ subscribers: subs.length, logs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
