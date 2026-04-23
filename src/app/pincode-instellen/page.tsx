"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Step = "kies" | "bevestig" | "opgeslagen";

export default function PincodeInstellenPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("kies");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleDigit = (d: string) => {
    setError("");
    if (step === "kies") {
      if (pin.length >= 4) return;
      const next = pin + d;
      setPin(next);
      if (next.length === 4) {
        if (next === "1234") {
          setError("Kies een andere pincode dan 1234");
          triggerShake();
          setTimeout(() => setPin(""), 600);
          return;
        }
        setTimeout(() => setStep("bevestig"), 200);
      }
    } else if (step === "bevestig") {
      if (confirmPin.length >= 4) return;
      const next = confirmPin + d;
      setConfirmPin(next);
      if (next.length === 4) {
        if (next !== pin) {
          setError("Pincodes komen niet overeen, probeer opnieuw");
          triggerShake();
          setTimeout(() => {
            setConfirmPin("");
            setError("");
          }, 600);
        } else {
          submitPin(next);
        }
      }
    }
  };

  const handleBackspace = () => {
    setError("");
    if (step === "kies") setPin((p) => p.slice(0, -1));
    else if (step === "bevestig") setConfirmPin((p) => p.slice(0, -1));
  };

  const handleBackToKies = () => {
    setStep("kies");
    setPin("");
    setConfirmPin("");
    setError("");
  };

  const submitPin = async (code: string) => {
    setLoading(true);
    const res = await fetch("/api/ouders/mijn-pin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: code }),
    });
    setLoading(false);
    if (res.ok) {
      setStep("opgeslagen");
      setTimeout(() => {
        router.push("/mijn");
        router.refresh();
      }, 1500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Er ging iets mis, probeer opnieuw");
      triggerShake();
      setConfirmPin("");
    }
  };

  const activeDots = step === "kies" ? pin : confirmPin;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/logo.png"
            alt="VVC Goes UK"
            width={200}
            height={90}
            className="h-16 w-auto object-contain mb-4"
            priority
          />
          <h1 className="text-lg font-semibold text-on-surface mb-1">Kies je eigen pincode</h1>
          <p className="text-sm text-on-surface-variant text-center">
            {step === "kies" && "Kies een pincode van 4 cijfers"}
            {step === "bevestig" && "Voer je nieuwe pincode nogmaals in"}
            {step === "opgeslagen" && "Pincode opgeslagen!"}
          </p>
        </div>

        {step === "opgeslagen" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-sm text-on-surface-variant">Je wordt doorgestuurd…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {step === "bevestig" && (
              <button
                onClick={handleBackToKies}
                className="self-start mb-6 flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface"
              >
                ← Andere pincode kiezen
              </button>
            )}

            <div className={`flex gap-4 mb-2 transition-transform ${shake ? "animate-shake" : ""}`}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i < activeDots.length
                      ? "bg-primary-container border-primary-container"
                      : "border-outline-variant/40 bg-transparent"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-xs text-red-500 mb-4 text-center">{error}</p>}
            {!error && <div className="mb-4" />}

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
                disabled={loading || activeDots.length === 0}
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
