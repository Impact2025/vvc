import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/auth";
import { verifyParentCookie } from "@/lib/parentAuth";

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/gif",
  "image/webp", "image/heic", "image/heif",
]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

async function isAuthorized(): Promise<boolean> {
  if (isAdmin()) return true;
  const raw = cookies().get("vvc_parent_session")?.value;
  if (!raw) return false;
  const parentId = await verifyParentCookie(raw);
  return parentId !== null;
}

export async function POST(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Alleen afbeeldingen zijn toegestaan (jpg, png, gif, webp, heic)" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Bestand is te groot (max 10 MB)" }, { status: 400 });
    }

    // Sanitize filename: strip path separators and non-safe characters
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);

    const blob = await put(`vvcgoesuk/${Date.now()}-${safeName}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
