"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface TikkieButtonProps {
  tikkieUrl: string;
  type?: "free" | "pakket_s" | "pakket_l";
  defaultAmount?: number;
  onSuccess?: () => void;
}

export default function TikkieButton({
  tikkieUrl,
  type = "free",
  defaultAmount,
  onSuccess,
}: TikkieButtonProps) {
  const [naam, setNaam] = useState("");
  const [bericht, setBericht] = useState("");
  const [bedrag, setBedrag] = useState(defaultAmount ? String(defaultAmount) : "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) {
      toast.error("Vul je naam in.");
      return;
    }
    if (type === "free" && !bedrag) {
      toast.error("Vul een bedrag in.");
      return;
    }

    setLoading(true);
    try {
      const amountCents = bedrag ? Math.round(parseFloat(bedrag) * 100) : null;

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: naam.trim(),
          message: bericht.trim() || null,
          amount: amountCents,
          type,
        }),
      });

      if (!res.ok) throw new Error("API error");

      setSuccess(true);
      onSuccess?.();
      window.open(tikkieUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle size={28} className="text-green-600" />
        </div>
        <p className="font-headline font-bold text-on-surface">Bedankt!</p>
        <p className="text-sm text-on-surface-variant max-w-xs">
          Betaal via Tikkie en je naam verschijnt op de donateursmuur.
        </p>
        <button
          onClick={() => window.open(tikkieUrl, "_blank", "noopener,noreferrer")}
          className="btn-primary flex items-center gap-2 mt-2"
        >
          Open Tikkie <ExternalLink size={14} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="section-label block mb-1.5">Jouw naam *</label>
        <input
          type="text"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          placeholder="Bijv. Familie Van Dam"
          required
          className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
        />
      </div>

      {type === "free" && (
        <div>
          <label className="section-label block mb-1.5">Bedrag (€) *</label>
          <input
            type="number"
            value={bedrag}
            onChange={(e) => setBedrag(e.target.value)}
            placeholder="10"
            min="1"
            step="0.01"
            required
            className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
          />
        </div>
      )}

      <div>
        <label className="section-label block mb-1.5">Bericht (optioneel)</label>
        <textarea
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          placeholder="Succes jongens!"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors resize-none"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full flex items-center gap-2">
        Doneer via Tikkie <ExternalLink size={14} />
      </Button>
      <p className="text-center text-[11px] text-on-surface-variant">
        Veilig betalen via Tikkie — je wordt doorgestuurd na invullen.
      </p>
    </form>
  );
}
