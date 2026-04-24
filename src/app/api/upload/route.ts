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

// Stap 1: browser vraagt token aan  → auth check hier (heeft cookies)
// Stap 2: Vercel Belt callback terug → geen cookies, intern geverifieerd door handleUpload
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await isAuthorized())) {
          throw new Error("Niet geautoriseerd");
        }
        return {
          allowedContentTypes: [
            "image/jpeg", "image/jpg", "image/png",
            "image/webp", "image/heic", "image/heif",
          ],
          maximumSizeInBytes: 25 * 1024 * 1024,
          tokenPayload: "",
        };
      },
      onUploadCompleted: async () => {
        // Vercel verifieert de completion intern — geen auth nodig
      },
    });

    return NextResponse.json(response);
  } catch (err) {
    const msg = (err as Error).message;
    const status = msg === "Niet geautoriseerd" ? 401 : 400;
    console.error("[upload]", msg);
    return NextResponse.json({ error: msg }, { status });
  }
}
