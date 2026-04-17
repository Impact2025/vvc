"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Photo {
  id: number;
  url: string;
  caption: string | null;
  uploader_name: string | null;
  match_id: number | null;
  approved: boolean | null;
  created_at: string | null;
}

interface Match {
  id: number;
  opponent: string;
  date: string;
}

export default function FotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [photosRes, matchesRes] = await Promise.all([
        fetch("/api/photos?approved=all"),
        fetch("/api/matches"),
      ]);
      const photosData = await photosRes.json();
      const matchesData = await matchesRes.json();
      setPhotos(photosData);
      setMatches(matchesData);
    } catch {
      toast.error("Kan data niet laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingPhotos = photos.filter((p) => !p.approved);
  const approvedPhotos = photos.filter((p) => p.approved);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Kies een bestand");
      return;
    }
    setUploading(true);
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload mislukt");
      const { url } = await uploadRes.json();

      // Save photo record
      const photoRes = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          caption: caption || null,
          match_id: selectedMatchId ? parseInt(selectedMatchId) : null,
          uploader_name: "Admin",
        }),
      });
      if (!photoRes.ok) throw new Error("Foto opslaan mislukt");

      toast.success("Foto geüpload");
      setSelectedFile(null);
      setCaption("");
      setSelectedMatchId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id: number, approved: boolean) => {
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) throw new Error();
      toast.success(approved ? "Foto goedgekeurd" : "Foto afgekeurd");
      fetchData();
    } catch {
      toast.error("Actie mislukt");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Foto verwijderen?")) return;
    try {
      const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Foto verwijderd");
      fetchData();
    } catch {
      toast.error("Verwijderen mislukt");
    }
  };

  const handleBatchApprove = async () => {
    if (pendingPhotos.length === 0) return;
    try {
      await Promise.all(
        pendingPhotos.map((p) =>
          fetch(`/api/photos/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approved: true }),
          })
        )
      );
      toast.success(`${pendingPhotos.length} foto's goedgekeurd`);
      fetchData();
    } catch {
      toast.error("Batch goedkeuren mislukt");
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-headline text-secondary">Foto's</h1>
        <p className="text-on-surface-variant mt-1 text-sm">Upload en beheer foto's van de tour.</p>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Foto uploaden</p>
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bestand *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-container/10 file:text-primary-container"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bijschrift</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optioneel bijschrift"
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Wedstrijd</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
            >
              <option value="">Geen wedstrijd</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.opponent} ({new Date(m.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full bg-primary-container text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {uploading ? "Uploaden..." : "Uploaden"}
            </button>
          </div>
        </form>
      </div>

      {/* Pending photos */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Wachtrij ({pendingPhotos.length})
          </p>
          {pendingPhotos.length > 0 && (
            <button
              onClick={handleBatchApprove}
              className="text-xs bg-primary-container text-white px-3 py-1.5 rounded font-semibold hover:opacity-90"
            >
              Alle goedkeuren
            </button>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Laden...</p>
        ) : pendingPhotos.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Geen foto's in de wachtrij.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pendingPhotos.map((photo) => (
              <div key={photo.id} className="rounded-lg overflow-hidden border border-outline-variant/20 group relative">
                <div className="aspect-square relative bg-surface-container-low">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? "Foto"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-2">
                  {photo.caption && <p className="text-xs text-on-surface-variant truncate mb-1">{photo.caption}</p>}
                  {photo.uploader_name && <p className="text-xs text-outline">{photo.uploader_name}</p>}
                </div>
                <div className="flex gap-1 p-2 pt-0">
                  <button
                    onClick={() => handleApprove(photo.id, true)}
                    className="flex-1 text-xs bg-green-600 text-white py-1.5 rounded font-semibold"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="flex-1 text-xs bg-red-100 text-red-700 py-1.5 rounded font-semibold"
                  >
                    Weg
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved photos */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Goedgekeurd ({approvedPhotos.length})
        </p>
        {approvedPhotos.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Nog geen goedgekeurde foto's.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {approvedPhotos.map((photo) => (
              <div key={photo.id} className="rounded-lg overflow-hidden border border-outline-variant/10 relative group">
                <div className="aspect-square relative bg-surface-container-low">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? "Foto"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Verwijderen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
