"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Image, Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/schema", label: "Wedstrijden", icon: Calendar },
  { href: "/fotos", label: "Foto's", icon: Image },
  { href: "/kids", label: "Kids", icon: Star },
  { href: "/doneren", label: "Steun ons", icon: Heart, orange: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-container-lowest/95 backdrop-blur-sm border-t border-outline-variant/10">
      <div className="flex items-stretch h-16">
        {navItems.map(({ href, label, icon: Icon, orange }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-150",
                orange
                  ? active
                    ? "text-[#f47920]"
                    : "text-[#f47920]/70 hover:text-[#f47920]"
                  : active
                  ? "text-primary-container"
                  : "text-outline hover:text-on-surface-variant"
              )}
            >
              <Icon size={20} strokeWidth={active || orange ? 2.5 : 1.75} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
