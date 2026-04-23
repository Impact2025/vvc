import { NextResponse } from "next/server";
import { sendVerslagToSubscribers } from "@/lib/email";
import { isAdmin, unauthorized } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdmin()) return unauthorized();

  try {
    const { html, subject } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "html is required" }, { status: 400 });
    }

    const emailSubject = subject ?? `VVC Goes UK — Weekendverslag ${new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`;

    const result = await sendVerslagToSubscribers(html, emailSubject);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
