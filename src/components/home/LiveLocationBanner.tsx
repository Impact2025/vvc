"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LiveLocationBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/location");
        const data = await res.json();
        setActive(!!data.active);
      } catch {
        // ignore
      }
    };

    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  if (!active) return null;

  return (
    <Link
      href="/londen"
      className="flex items-center gap-3 px-4 py-3 mb-6 rounded-2xl bg-[#1a3e8f] text-white hover:bg-[#162f6b] transition-colors"
    >
      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse flex-shrink-0" />
      <span className="font-bold text-sm font-headline flex-1">
        VVC is nu live te volgen op de kaart
      </span>
      <span className="text-white/70 text-xs font-semibold">Bekijk →</span>
    </Link>
  );
}
