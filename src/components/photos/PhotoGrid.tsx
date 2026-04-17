"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/db/schema";

interface PhotoGridProps {
  photos: Photo[];
  matchTitle?: string;
}

interface LightboxState {
  open: boolean;
  index: number;
}

export default function PhotoGrid({ photos, matchTitle }: PhotoGridProps) {
  const [lightbox, setLightbox] = useState<LightboxState>({ open: false, index: 0 });

  const openLightbox = (index: number) => setLightbox({ open: true, index });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });

  const prev = useCallback(() => {
    setLightbox((s) => ({ ...s, index: (s.index - 1 + photos.length) % photos.length }));
  }, [photos.length]);

  const next = useCallback(() => {
    setLightbox((s) => ({ ...s, index: (s.index + 1) % photos.length }));
  }, [photos.length]);

  useEffect(() => {
    if (!lightbox.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightbox.open, prev, next]);

  if (photos.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-on-surface-variant text-sm">
          Nog geen foto's — kom terug tijdens de tour!
        </p>
      </div>
    );
  }

  const current = photos[lightbox.index];

  return (
    <>
      {/* Bento Grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(i)}
            className={cn(
              "relative overflow-hidden rounded-xl bg-surface-container group cursor-pointer",
              i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
            )}
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? matchTitle ?? "VVC foto"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={i === 0 ? "(max-width: 768px) 66vw, 660px" : "(max-width: 768px) 33vw, 330px"}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <ZoomIn
                size={24}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs font-medium line-clamp-2">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          {/* Fullscreen image as background */}
          <div className="absolute inset-0">
            <Image
              src={current.url}
              alt={current.caption ?? "VVC foto"}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/50" />
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
            <p className="text-white/60 text-sm font-semibold tabular-nums">
              {lightbox.index + 1} / {photos.length}
            </p>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              aria-label="Sluiten"
            >
              <X size={20} />
            </button>
          </div>

          {/* Prev / Next */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
            aria-label="Vorige"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
            aria-label="Volgende"
          >
            <ChevronRight size={22} />
          </button>

          {/* Caption overlay — bottom */}
          {(current.caption || current.uploader_name) && (
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-16 z-10">
              {current.caption && (
                <p className="text-white font-bold text-lg leading-snug drop-shadow-lg max-w-lg">
                  {current.caption}
                </p>
              )}
              {current.uploader_name && (
                <p className="text-white/60 text-sm mt-1.5 font-medium">
                  📸 {current.uploader_name}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
