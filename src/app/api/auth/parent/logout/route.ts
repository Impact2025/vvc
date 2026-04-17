import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("vvc_parent_session");
  return NextResponse.json({ ok: true });
}
