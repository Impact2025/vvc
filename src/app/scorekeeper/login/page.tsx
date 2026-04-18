"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ScorekeeperLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (pin.length !== 4) return;
    setLoading(true);
    setError("");
    fetch("/api/scorekeeper/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    }).then((res) => {
      if (res.ok) {
        router.push("/scorekeeper");
        router.refresh();
      } else {
        setError("Onjuiste code. Probeer opnieuw.");
        setPin("");
        setLoading(false);
      }
    });
  }, [pin, router]);

  const tap = (d: string) => {
    if (loading || pin.length >= 4) return;
    setPin((p) => p + d);
  };

  const del = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="VVC Goes UK"
            width={180}
            height={80}
            className="h-16 w-auto object-contain mb-4"
            priority
          />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Score bijhouden
          </span>
        </div>

        <div className="bg-white rounded-2xl px-6 py-8 shadow-sm border border-gray-100">
          <h1 className="text-xl font-black text-center text-gray-800 mb-1">Inloggen</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Voer je 4-cijferige code in</p>

          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > i ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center mb-5 font-medium">{error}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => tap(d)}
                disabled={loading}
                className="h-14 rounded-xl bg-gray-50 text-xl font-bold text-gray-800 active:bg-gray-200 border border-gray-100 disabled:opacity-40 transition-colors"
              >
                {d}
              </button>
            ))}
            <div />
            <button
              onClick={() => tap("0")}
              disabled={loading}
              className="h-14 rounded-xl bg-gray-50 text-xl font-bold text-gray-800 active:bg-gray-200 border border-gray-100 disabled:opacity-40 transition-colors"
            >
              0
            </button>
            <button
              onClick={del}
              disabled={loading || pin.length === 0}
              className="h-14 rounded-xl bg-gray-50 text-xl font-bold text-gray-400 active:bg-gray-200 border border-gray-100 disabled:opacity-30 transition-colors"
            >
              ⌫
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">VVC Goes UK &copy; 2026</p>
      </div>
    </div>
  );
}
