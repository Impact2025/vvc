"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ParentSession {
  id: number;
  naam: string;
  kan_fotos_uploaden: boolean;
  kan_commentaar: boolean;
}

const navLinks = [
  { href: "/schema", label: "Wedstrijden" },
  { href: "/fotos", label: "Foto's" },
  { href: "/kids", label: "Kids" },
  { href: "/doneren", label: "Doneren" },
];

interface HeaderProps {
  activePage?: string;
}

export default function Header({ activePage }: HeaderProps) {
  const pathname = usePathname();
  const [parent, setParent] = useState<ParentSession | null>(null);

  useEffect(() => {
    fetch("/api/ouders/me")
      .then((r) => r.json())
      .then((data) => setParent(data))
      .catch(() => setParent(null));
  }, []);

  const logout = async () => {
    await fetch("/api/ouders/logout", { method: "POST" });
    setParent(null);
  };

  function isActive(href: string) {
    return pathname.startsWith(href) || activePage === href.replace("/", "");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-sm border-b border-outline-variant/10 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="FC VVC Onder 10 Goes UK"
            width={120}
            height={56}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold font-headline transition-all duration-150",
                isActive(link.href)
                  ? "bg-primary-fixed text-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Meldingen"
          >
            <Bell size={18} />
          </button>
          {parent ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs font-semibold text-on-surface-variant">
                {parent.naam.split(" ")[0]}
              </span>
              <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container text-sm font-black font-headline">
                {parent.naam.charAt(0)}
              </div>
              <button
                onClick={logout}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                aria-label="Uitloggen"
                title="Uitloggen"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/admin"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-xs font-bold"
              aria-label="Admin"
            >
              <span>A</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
