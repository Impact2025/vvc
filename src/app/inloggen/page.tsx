"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Parent {
  id: number;
  naam: string;
  kind_naam: string | null;
}

function Initials({ naam }: { naam: string }) {
  const parts = naam.trim().split(" ");
  const init = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return <span className="text-xl font-bold text-white">{init.toUpperCase()}</span>;
}

export default function InloggenPage() {
  const router = useRouter();
  const [parents, setParents] = useState<Parent[]>([]);
  const [selected, setSelected] = useState<Parent | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ouders/login")
      .then((r) => r.ok ? r.json() : [])
      .then(setParents)
      .catch(() => setParents([]));
  }, []);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) submitPin(next);
  };

  const handleBackspace = () => setPin((p) => p.slice(0, -1));

  const submitPin = async (code: string) => {
    if (!selected) return;
    setLoading(true);
    const res = await fetch("/api/ouders/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent_id: selected.id, pin: code }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/mijn");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setPin("");
      setError(data.error ?? "Verkeerde pincode, probeer opnieuw.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/logo.png"
            alt="VVC Goes UK"
            width={200}
            height={90}
            className="h-16 w-auto object-contain mb-4"
            priority
          />
          <p className="text-sm text-on-surface-variant">Kies je naam en voer je pincode in</p>
        </div>

        {!selected ? (
          /* Stap 1: kies naam */
          <div className="space-y-3">
            {parents.length === 0 && (
              <p className="text-center text-sm text-on-surface-variant">Laden...</p>
            )}
            {parents.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="w-full flex items-center gap-4 bg-white border border-outline-variant/15 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-primary-container/40 transition-all text-left"
              >
                <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <Initials naam={p.naam} />
                </div>
                <div>
                  <p className="font-semibold text-on-surface">{p.naam}</p>
                  {p.kind_naam && (
                    <p className="text-xs text-on-surface-variant">Ouder van {p.kind_naam}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Stap 2: PIN invoeren */
          <div className="flex flex-col items-center">
            <button
              onClick={() => { setSelected(null); setPin(""); setError(""); }}
              className="self-start mb-6 flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface"
            >
              ← Terug
            </button>

            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mb-3">
              <Initials naam={selected.naam} />
            </div>
            <p className="font-semibold text-on-surface mb-1">{selected.naam}</p>
            {selected.kind_naam && (
              <p className="text-xs text-on-surface-variant mb-6">Ouder van {selected.kind_naam}</p>
            )}

            {/* PIN dots */}
            <div className={`flex gap-4 mb-2 transition-transform ${shake ? "animate-shake" : ""}`}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i < pin.length
                      ? "bg-primary-container border-primary-container"
                      : "border-outline-variant/40 bg-transparent"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-xs text-red-500 mb-4 text-center">{error}</p>}
            {!error && <div className="mb-4" />}

            {/* PIN pad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  disabled={loading}
                  className="aspect-square rounded-2xl bg-white border border-outline-variant/15 shadow-sm text-2xl font-semibold text-on-surface hover:bg-surface-container active:scale-95 transition-all disabled:opacity-50"
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleDigit("0")}
                disabled={loading}
                className="aspect-square rounded-2xl bg-white border border-outline-variant/15 shadow-sm text-2xl font-semibold text-on-surface hover:bg-surface-container active:scale-95 transition-all disabled:opacity-50"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                disabled={loading || pin.length === 0}
                className="aspect-square rounded-2xl bg-white border border-outline-variant/15 shadow-sm text-xl text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all disabled:opacity-30"
              >
                ⌫
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
