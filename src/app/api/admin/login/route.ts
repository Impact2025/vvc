import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { checkRateLimit, tooManyRequests } from "@/lib/auth";
import { headers } from "next/headers";

function safeEq(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(`admin-login:${ip}`, 5, 5 * 60_000)) {
    return tooManyRequests();
  }

  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD ?? "";

  if (!safeEq(String(password ?? ""), expected)) {
    return NextResponse.json({ error: "Ongeldig wachtwoord" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("vvc_admin_session", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
