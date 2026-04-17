"use server";

import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signParentCookie } from "@/lib/parentAuth";

export async function claimInvite(token: string) {
  const [parent] = await db
    .select()
    .from(parents)
    .where(eq(parents.invite_token, token));

  if (!parent) redirect("/invite/ongeldig");

  if (parent.token_expires_at && new Date(parent.token_expires_at) < new Date()) {
    redirect("/invite/verlopen");
  }

  const cookieValue = await signParentCookie(parent.id);
  const cookieStore = await cookies();
  cookieStore.set("vvc_parent_session", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  redirect("/mijn");
}
