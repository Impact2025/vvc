import { db } from "@/db";
import { blog_posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — VVC Goes UK",
  description: "Verhalen, updates en verslagen van de VVC London Tour.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await db
    .select()
    .from(blog_posts)
    .where(eq(blog_posts.published, true))
    .orderBy(desc(blog_posts.created_at));

  return (
    <>
      <Header />
      <main className="mt-20 pb-28 max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-container mb-1">VVC Goes UK</p>
          <h1 className="text-3xl font-black font-headline text-secondary">Blog</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Verhalen en updates van de London Tour.</p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-outline-variant/15 p-16 text-center shadow-sm">
            <p className="font-bold text-on-surface">Nog geen artikelen</p>
            <p className="text-sm text-on-surface-variant mt-1">Kom later terug voor updates!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md hover:border-primary-container/20 transition-all overflow-hidden"
              >
                {post.cover_image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                    {new Date(post.created_at!).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <h2 className="font-black font-headline text-on-surface text-lg group-hover:text-primary-container transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-on-surface-variant mt-1.5 line-clamp-2">{post.excerpt}</p>
                  )}
                  <span className="inline-block mt-3 text-xs font-bold text-primary-container">
                    Lees verder →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
