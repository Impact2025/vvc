import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pin } = await req.json();

  if (pin !== process.env.SCOREKEEPER_PIN) {
    return NextResponse.json({ error: "Onjuiste code" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("vvc_scorekeeper_session", process.env.SCOREKEEPER_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
