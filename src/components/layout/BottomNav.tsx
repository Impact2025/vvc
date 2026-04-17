"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Image, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const baseItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/schema", label: "Wedstrijden", icon: Calendar },
  { href: "/fotos", label: "Foto's", icon: Image },
  { href: "/kids", label: "Kids", icon: Star },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/ouders/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d))
      .catch(() => {});
  }, []);

  const navItems = [
    ...baseItems,
    loggedIn
      ? { href: "/mijn", label: "Mijn", icon: User }
      : { href: "/inloggen", label: "Inloggen", icon: User },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-container-lowest/95 backdrop-blur-sm border-t border-outline-variant/10">
      <div className="flex items-stretch h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-150",
                active
                  ? "text-primary-container"
                  : "text-outline hover:text-on-surface-variant"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
