"use client";

import { useState } from "react";
import { Upload, X, CheckCircle } from "lucide-react";

interface Props {
  parentId: number;
  parentNaam: string;
  matches: { id: number; opponent: string }[];
}

type Status = "idle" | "uploading" | "done" | "error";

export default function FotoUpload({ parentId, parentNaam, matches }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [matchId, setMatchId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus("uploading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error("upload failed");
      const { url } = await uploadRes.json();

      const saveRes = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          caption: caption.trim() || null,
          uploader_name: parentNaam,
          uploader_parent_id: parentId,
          match_id: matchId ? parseInt(matchId) : null,
        }),
      });
      if (!saveRes.ok) throw new Error("save failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setCaption("");
    setMatchId("");
    setStatus("idle");
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
        <Upload size={16} />
        Foto uploaden
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center p-4 pb-20 sm:pb-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="font-headline font-bold text-on-surface">Foto uploaden</h2>
              <button
                onClick={reset}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pb-6">
              {status === "done" ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <p className="font-headline font-bold text-on-surface text-lg">Foto geplaatst!</p>
                  <p className="text-sm text-on-surface-variant mt-1 mb-6">
                    Wordt goedgekeurd door de beheerder.
                  </p>
                  <button onClick={reset} className="btn-secondary">
                    Nog een foto
                  </button>
                </div>
              ) : (
                <>
                  {/* Drop zone — label triggert input direct (betrouwbaarder op Android PWA) */}
                  <label
                    htmlFor="foto-file-input"
                    className="border-2 border-dashed border-outline-variant/40 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-primary-container/60 hover:bg-primary-fixed/10 transition-colors mb-4 overflow-hidden relative"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Upload size={32} className="text-on-surface-variant mb-2" />
                        <p className="text-sm font-semibold text-on-surface-variant">
                          Tik om foto te kiezen
                        </p>
                        <p className="text-xs text-outline mt-1">JPG, PNG of HEIC</p>
                      </>
                    )}
                  </label>
                  <input
                    id="foto-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />

                  <input
                    type="text"
                    placeholder="Bijschrift (optioneel)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm mb-3 focus:border-primary-container focus:outline-none bg-white"
                  />

                  <select
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm mb-5 focus:border-primary-container focus:outline-none bg-white"
                  >
                    <option value="">Algemeen</option>
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        VVC vs {m.opponent}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSubmit}
                    disabled={!file || status === "uploading"}
                    className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "uploading" ? "Uploaden..." : "Plaatsen"}
                  </button>

                  {status === "error" && (
                    <p className="text-red-500 text-xs text-center mt-3">
                      Upload mislukt. Controleer je verbinding en probeer opnieuw.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
