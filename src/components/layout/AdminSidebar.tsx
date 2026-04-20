"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  Images,
  MessageSquare,
  Heart,
  Users,
  UserCheck,
  Settings,
  LogOut,
  MapPin,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/wedstrijden", label: "Wedstrijden", icon: Swords },
  { href: "/admin/fotos", label: "Foto's", icon: Images },
  { href: "/admin/reacties", label: "Reacties", icon: MessageSquare },
  { href: "/admin/donaties", label: "Donaties", icon: Heart },
  { href: "/admin/spelers", label: "Spelers", icon: Users },
  { href: "/admin/ouders", label: "Ouders", icon: UserCheck },
  { href: "/admin/locatie", label: "Live Locatie", icon: MapPin },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/instellingen", label: "Instellingen", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/15 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-outline-variant/10">
        <Link href="/" className="vvc-logo text-xl">
          VVC<span>.</span>
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline mt-0.5">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold font-headline transition-all duration-150",
                active
                  ? "bg-surface-container text-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-outline-variant/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold font-headline text-outline hover:bg-surface-container-low hover:text-error transition-all duration-150 w-full"
        >
          <LogOut size={18} />
          Uitloggen
        </button>
      </div>
    </aside>
  );
}
