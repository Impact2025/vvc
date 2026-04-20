import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { blog_posts } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const posts = await db.select().from(blog_posts).orderBy(desc(blog_posts.created_at));
    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) + "-" + Date.now().toString(36);
}

export async function POST(req: Request) {
  try {
    const { title, content, excerpt, cover_image, published } = await req.json();
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const slug = generateSlug(title);
    const [post] = await db.insert(blog_posts).values({
      title,
      slug,
      content: content ?? "",
      excerpt: excerpt ?? null,
      cover_image: cover_image ?? null,
      published: published ?? false,
    }).returning();

    revalidatePath("/blog");
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
