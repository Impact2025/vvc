import { cookies } from "next/headers";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyParentCookie } from "@/lib/parentAuth";

export interface ParentSession {
  id: number;
  naam: string;
  kind_naam: string | null;
  rol: string | null;
  kan_fotos_uploaden: boolean | null;
  kan_commentaar: boolean | null;
  kan_scores_bijhouden: boolean | null;
  pincode_is_tijdelijk: boolean | null;
}

export async function getParentSession(): Promise<ParentSession | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("vvc_parent_session")?.value;
    if (!raw) return null;
    const parentId = await verifyParentCookie(raw);
    if (!parentId) return null;
    const [parent] = await db
      .select({
        id: parents.id,
        naam: parents.naam,
        kind_naam: parents.kind_naam,
        rol: parents.rol,
        kan_fotos_uploaden: parents.kan_fotos_uploaden,
        kan_commentaar: parents.kan_commentaar,
        kan_scores_bijhouden: parents.kan_scores_bijhouden,
        pincode_is_tijdelijk: parents.pincode_is_tijdelijk,
      })
      .from(parents)
      .where(eq(parents.id, parentId));
    return parent ?? null;
  } catch {
    return null;
  }
}
