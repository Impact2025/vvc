import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/auth";
import { verifyParentCookie } from "@/lib/parentAuth";

async function isAuthorized(): Promise<boolean> {
  if (isAdmin()) return true;
  const raw = cookies().get("vvc_parent_session")?.value;
  if (!raw) return false;
  return (await verifyParentCookie(raw)) !== null;
}

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png",
  "image/webp", "image/heic", "image/heif",
]);

export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get("content-type") ?? "";

  // ── FormData (gecachede PWA / oude client) ──────────────────────
  if (contentType.includes("multipart/form-data")) {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "Geen bestand" }, { status: 400 });
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json({ error: "Ongeldig bestandstype" }, { status: 400 });
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      const blob = await put(`vvcgoesuk/${Date.now()}-${safeName}`, file, { access: "public" });
      return NextResponse.json({ url: blob.url });
    } catch (err) {
      console.error("[upload] FormData fallback:", err);
      return NextResponse.json({ error: "Upload mislukt" }, { status: 500 });
    }
  }

  // ── JSON / handleUpload (nieuwe client) ─────────────────────────
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  // Token-aanvraag komt van de browser (cookies aanwezig) → auth vereist
  // Completion-callback komt van Vercel servers (geen cookies) → intern geverifieerd
  if (body.type === "blob.generate-client-token") {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...ALLOWED_TYPES],
        maximumSizeInBytes: 25 * 1024 * 1024,
        tokenPayload: "",
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(response);
  } catch (err) {
    console.error("[upload] handleUpload:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
