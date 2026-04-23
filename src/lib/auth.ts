import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function safeEq(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export function isAdmin(): boolean {
  const session = cookies().get("vvc_admin_session")?.value;
  return safeEq(session, process.env.ADMIN_SECRET);
}

export function isScorekeeper(): boolean {
  const session = cookies().get("vvc_scorekeeper_session")?.value;
  return safeEq(session, process.env.SCOREKEEPER_SECRET);
}

export function isAdminOrScorekeeper(): boolean {
  return isAdmin() || isScorekeeper();
}

export function unauthorized(msg = "Niet geautoriseerd"): NextResponse {
  return NextResponse.json({ error: msg }, { status: 401 });
}

export function tooManyRequests(): NextResponse {
  return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });
}

// In-memory rate limiter (per serverless instance; adequate for low-traffic admin endpoints)
const rl = new Map<string, { n: number; resetAt: number }>();

export function checkRateLimit(key: string, max = 5, windowMs = 5 * 60_000): boolean {
  const now = Date.now();
  const e = rl.get(key);
  if (!e || now > e.resetAt) {
    rl.set(key, { n: 1, resetAt: now + windowMs });
    return true;
  }
  if (e.n >= max) return false;
  e.n++;
  return true;
}
