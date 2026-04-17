"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Parent {
  id: number;
  naam: string;
  kind_naam: string | null;
  rol: string | null;
  kan_fotos_uploaden: boolean | null;
  kan_commentaar: boolean | null;
}

export default function ParentWelcome() {
  const router = useRouter();
  const [parent, setParent] = useState<Parent | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/ouders/me")
      .then((r) => r.json())
      .then(setParent)
      .catch(() => setParent(null));
  }, []);

  const logout = async () => {
    await fetch("/api/ouders/logout", { method: "POST" });
    setParent(null);
    router.refresh();
  };

  if (parent === undefined) return null;

  if (!parent) {
    return (
      <Link
        href="/inloggen"
        className="flex items-center gap-4 bg-white border border-outline-variant/15 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-primary-container/40 transition-all mb-8"
      >
        <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-xl">
          👋
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface text-sm">Inloggen als ouder</p>
          <p className="text-xs text-on-surface-variant">Kies je naam en voer je pincode in</p>
        </div>
        <span className="text-on-surface-variant text-lg">›</span>
      </Link>
    );
  }

  const initials = (() => {
    const parts = parent.naam.trim().split(" ");
    return parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  })().toUpperCase();

  return (
    <div className="flex items-center gap-4 bg-white border border-outline-variant/15 rounded-2xl px-5 py-4 shadow-sm mb-8">
      <Link href="/mijn" className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-base">{initials}</span>
      </Link>
      <Link href="/mijn" className="flex-1 min-w-0">
        <p className="font-semibold text-on-surface text-sm">Hey, {parent.naam.split(" ")[0]}! <span className="text-xs text-primary-container font-bold">→ Mijn dashboard</span></p>
        {parent.kind_naam && (
          <p className="text-xs text-on-surface-variant">Ouder van {parent.kind_naam}</p>
        )}
      </Link>
      <button
        onClick={logout}
        className="text-xs text-on-surface-variant border border-outline-variant/20 rounded-lg px-3 py-1.5 hover:bg-surface-container transition-colors flex-shrink-0"
      >
        Uitloggen
      </button>
    </div>
  );
}
