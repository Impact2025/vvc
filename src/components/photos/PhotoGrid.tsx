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
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-white/60 text-sm font-medium">
              {lightbox.index + 1} / {photos.length}
            </p>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Sluiten"
            >
              <X size={20} />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center px-16">
            <button
              onClick={prev}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Vorige"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="relative w-full h-full max-w-4xl">
              <Image
                src={current.url}
                alt={current.caption ?? "VVC foto"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
              />
            </div>

            <button
              onClick={next}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Volgende"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Caption */}
          {current.caption && (
            <div className="px-6 py-4 text-center">
              <p className="text-white/80 text-sm">{current.caption}</p>
              {current.uploader_name && (
                <p className="text-white/40 text-xs mt-1">Door {current.uploader_name}</p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
