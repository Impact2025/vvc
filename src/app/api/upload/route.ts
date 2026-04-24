import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
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

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  // Token-aanvraag komt van de browser (heeft cookies) → auth vereist
  // Completion-callback komt van Vercel servers (geen cookies) → geen auth
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
        allowedContentTypes: [
          "image/jpeg", "image/jpg", "image/png",
          "image/webp", "image/heic", "image/heif",
        ],
        maximumSizeInBytes: 25 * 1024 * 1024,
        tokenPayload: "",
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(response);
  } catch (err) {
    console.error("[upload] handleUpload error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
