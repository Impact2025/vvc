"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Ongeldig wachtwoord. Probeer opnieuw.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xs">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/logo.png"
            alt="VVC Goes UK"
            width={180}
            height={80}
            className="h-16 w-auto object-contain mb-4"
            priority
          />
          <span className="text-xs font-bold uppercase tracking-widest text-outline">
            Admin Panel
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border border-outline-variant/15 rounded-2xl px-6 py-8 shadow-sm">
          <h1 className="text-xl font-black font-headline text-on-surface mb-1">Inloggen</h1>
          <p className="text-sm text-on-surface-variant mb-6">Voer het beheerderswachtwoord in.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full border border-outline-variant/30 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/15 bg-white transition-shadow"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-primary-container text-white font-bold font-headline text-sm uppercase tracking-wider py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Bezig..." : "Inloggen"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-outline mt-6">
          VVC Goes UK &copy; 2026 — WeAreImpact
        </p>
      </div>
    </div>
  );
}
