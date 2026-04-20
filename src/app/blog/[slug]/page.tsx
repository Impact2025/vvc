import { db } from "@/db";
import { blog_posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [post] = await db.select().from(blog_posts).where(eq(blog_posts.slug, params.slug));
  if (!post) return {};
  return {
    title: `${post.title} — VVC Goes UK`,
    description: post.excerpt ?? undefined,
    openGraph: post.cover_image ? { images: [post.cover_image] } : undefined,
  };
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: Props) {
  const [post] = await db
    .select()
    .from(blog_posts)
    .where(eq(blog_posts.slug, params.slug));

  if (!post || !post.published) notFound();

  return (
    <>
      <Header />
      <main className="mt-20 pb-28 max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-6">
          ← Terug naar blog
        </Link>

        {/* Cover */}
        {post.cover_image && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Meta */}
        <p className="text-xs font-bold uppercase tracking-widest text-outline mb-2">
          {new Date(post.created_at!).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <h1 className="text-3xl font-black font-headline text-secondary mb-4">{post.title}</h1>

        {post.excerpt && (
          <p className="text-base text-on-surface-variant border-l-4 border-primary-container/40 pl-4 mb-6 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-sm max-w-none
            prose-headings:font-headline prose-headings:text-secondary
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            prose-a:text-primary-container prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-sm
            prose-blockquote:border-primary-container/40 prose-blockquote:text-on-surface-variant
            prose-strong:text-on-surface"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>
      <BottomNav />
    </>
  );
}
