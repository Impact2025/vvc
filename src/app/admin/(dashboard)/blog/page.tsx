"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { PlusCircle, Pencil, Trash2, Globe, EyeOff } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function BlogAdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const res = await fetch("/api/blog");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const togglePublished = async (post: Post) => {
    const res = await fetch(`/api/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, published: !p.published } : p));
      toast.success(post.published ? "Verborgen" : "Gepubliceerd");
    }
  };

  const deletePost = async (post: Post) => {
    if (!confirm(`"${post.title}" verwijderen?`)) return;
    const res = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success("Verwijderd");
    }
  };

  return (
    <div>
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline text-secondary">Blog</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Beheer blog artikelen en updates.</p>
        </div>
        <button
          onClick={() => router.push("/admin/blog/nieuw")}
          className="flex items-center gap-2 bg-primary-container text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={16} />
          Nieuw artikel
        </button>
      </div>

      {loading ? (
        <p className="text-on-surface-variant text-sm text-center py-16">Laden…</p>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant/15 p-16 text-center shadow-sm">
          <p className="font-bold text-on-surface mb-1">Nog geen artikelen</p>
          <p className="text-sm text-on-surface-variant">Klik op &quot;Nieuw artikel&quot; om te beginnen.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-outline-variant/15 p-4 shadow-sm flex items-center gap-4">
              {post.cover_image && (
                <img src={post.cover_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.published ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"}`}>
                    {post.published ? "Gepubliceerd" : "Concept"}
                  </span>
                </div>
                <p className="font-bold text-on-surface text-sm truncate">{post.title}</p>
                {post.excerpt && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{post.excerpt}</p>}
                <p className="text-[10px] text-outline mt-1">
                  {new Date(post.updated_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePublished(post)}
                  title={post.published ? "Verbergen" : "Publiceren"}
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  {post.published ? <EyeOff size={16} /> : <Globe size={16} />}
                </button>
                <button
                  onClick={() => router.push(`/admin/blog/${post.id}`)}
                  title="Bewerken"
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deletePost(post)}
                  title="Verwijderen"
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
