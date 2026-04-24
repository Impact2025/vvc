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

// Client-side direct upload: browser → Vercel Blob (bypasses 4.5 MB serverless limit)
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/jpeg", "image/jpg", "image/png",
          "image/webp", "image/heic", "image/heif",
        ],
        maximumSizeInBytes: 25 * 1024 * 1024, // 25 MB — ruim voor iPhone RAW
        tokenPayload: "",
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(response);
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
