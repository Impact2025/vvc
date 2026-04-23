import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { blog_posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

interface RouteContext { params: { id: string } }

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const [post] = await db.select().from(blog_posts).where(eq(blog_posts.id, id));
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  if (!isAdmin()) return unauthorized();

  try {
    const id = parseInt(params.id);
    const { title, content, excerpt, cover_image, published } = await req.json();

    const updateData: Partial<typeof blog_posts.$inferInsert> = { updated_at: new Date() };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (published !== undefined) updateData.published = published;

    const [updated] = await db.update(blog_posts).set(updateData).where(eq(blog_posts.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  if (!isAdmin()) return unauthorized();

  try {
    const id = parseInt(params.id);
    const [deleted] = await db.delete(blog_posts).where(eq(blog_posts.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    revalidatePath("/blog");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
