"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, BellRing, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}

async function subscribeAndSave() {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub }),
  });
}

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
  { href: "/blog", label: "Blog" },
  { href: "/doneren", label: "Doneren" },
];

interface HeaderProps {
  activePage?: string;
}

export default function Header({ activePage }: HeaderProps) {
  const pathname = usePathname();
  const [parent, setParent] = useState<ParentSession | null>(null);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ouders/me")
      .then((r) => r.json())
      .then((data) => setParent(data))
      .catch(() => setParent(null));

    if ("Notification" in window) {
      setNotifPerm(Notification.permission);
      navigator.serviceWorker?.register("/sw.js").catch(console.error);
    }
  }, []);

  async function handleBell() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    if (Notification.permission === "granted") {
      showToast("Meldingen staan al aan ✓");
      return;
    }
    if (Notification.permission === "denied") {
      showToast("Sta meldingen toe in je browserinstellingen");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === "granted") {
      await subscribeAndSave().catch(console.error);
      showToast("Meldingen aan! ✓");
    }
  }

  function showToast(msg: string) {
    setNotifToast(msg);
    setTimeout(() => setNotifToast(null), 3000);
  }

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
        <Link href={parent ? "/mijn" : "/"} className="flex items-center shrink-0">
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
        <div className="flex items-center gap-2 relative">
          {notifToast && (
            <div className="absolute right-10 top-10 bg-on-surface text-surface text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {notifToast}
            </div>
          )}
          <button
            onClick={handleBell}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
              notifPerm === "granted"
                ? "text-primary-container"
                : "text-on-surface-variant hover:bg-surface-container"
            )}
            aria-label="Meldingen"
            title={notifPerm === "granted" ? "Meldingen aan" : "Meldingen aanzetten"}
          >
            {notifPerm === "granted" ? <BellRing size={18} /> : <Bell size={18} />}
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
              href="/inloggen"
              className="px-3 py-1.5 rounded-lg text-sm font-bold font-headline border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              Inloggen
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
