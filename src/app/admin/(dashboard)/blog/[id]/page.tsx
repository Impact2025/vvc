"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Save, Globe, EyeOff, Upload, X } from "lucide-react";

const BlogEditor = dynamic(() => import("@/components/admin/BlogEditor"), { ssr: false });

const isNew = (id: string) => id === "nieuw";

export default function BlogEditorPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew(id));
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    if (isNew(id)) return;
    fetch(`/api/blog/${id}`)
      .then((r) => r.json())
      .then((post) => {
        setTitle(post.title ?? "");
        setExcerpt(post.excerpt ?? "");
        setContent(post.content ?? "");
        setCoverImage(post.cover_image ?? "");
        setPublished(post.published ?? false);
        setLoading(false);
      })
      .catch(() => { toast.error("Kan artikel niet laden"); setLoading(false); });
  }, [id]);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload mislukt");
    const { url } = await res.json();
    return url;
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      setCoverImage(url);
    } catch { toast.error("Cover upload mislukt"); }
    finally { setCoverUploading(false); }
  };

  const save = async (pub?: boolean) => {
    if (!title.trim()) { toast.error("Titel is verplicht"); return; }
    setSaving(true);
    const body = {
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      content,
      cover_image: coverImage || null,
      published: pub ?? published,
    };
    try {
      const res = await fetch(
        isNew(id) ? "/api/blog" : `/api/blog/${id}`,
        { method: isNew(id) ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      if (!res.ok) throw new Error();
      const saved = await res.json();
      if (pub !== undefined) setPublished(pub);
      toast.success(isNew(id) ? "Artikel aangemaakt" : "Opgeslagen");
      if (isNew(id)) router.replace(`/admin/blog/${saved.id}`);
    } catch { toast.error("Opslaan mislukt"); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-on-surface-variant">Laden…</p></div>;
  }

  return (
    <div className="max-w-4xl">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push("/admin/blog")} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
          <ArrowLeft size={16} />
          Terug naar overzicht
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save(!published)}
            disabled={saving}
            className="flex items-center gap-2 border border-outline-variant/30 text-on-surface-variant px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {published ? <EyeOff size={15} /> : <Globe size={15} />}
            {published ? "Verbergen" : "Publiceren"}
          </button>
          <button
            onClick={() => save()}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Opslaan…" : "Opslaan"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${published ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"}`}>
            {published ? "Gepubliceerd" : "Concept"}
          </span>
        </div>

        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Artikeltitel…"
            className="w-full text-2xl font-bold font-headline text-secondary border-0 border-b border-outline-variant/20 pb-3 focus:outline-none focus:border-primary-container bg-transparent placeholder:text-outline"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Samenvatting (optioneel)</label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Korte beschrijving voor de overzichtspagina…"
            className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Cover afbeelding</label>
          {coverImage ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-container">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <button
                onClick={() => setCoverImage("")}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-outline-variant/40 cursor-pointer hover:border-primary-container/50 hover:bg-surface-container/30 transition-colors">
              {coverUploading ? (
                <p className="text-sm text-on-surface-variant">Uploaden…</p>
              ) : (
                <>
                  <Upload size={24} className="text-outline mb-2" />
                  <p className="text-sm font-semibold text-on-surface-variant">Klik om cover te uploaden</p>
                  <p className="text-xs text-outline mt-1">JPG, PNG of WEBP</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={uploadCover} disabled={coverUploading} />
            </label>
          )}
        </div>

        {/* Rich text editor */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Inhoud</label>
          <BlogEditor
            content={content}
            onChange={setContent}
            onImageUpload={uploadImage}
          />
        </div>
      </div>
    </div>
  );
}
