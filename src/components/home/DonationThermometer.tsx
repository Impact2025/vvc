"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { formatEuro } from "@/lib/utils";

interface DonationThermometerProps {
  raised: number; // in cents
  goal: number;   // in cents
  tikkieUrl: string;
}

export default function DonationThermometer({
  raised,
  goal,
  tikkieUrl,
}: DonationThermometerProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const percent = Math.min(Math.round((raised / goal) * 100), 100);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percent), 300);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="card card-hover p-6 h-full">
      {/* Header */}
      <div className="mb-4">
        <p className="section-label mb-1">UK Tour Fund</p>
        <h3 className="text-lg font-black font-headline text-on-surface">
          Help ons naar Londen!
        </h3>
        <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
          Elke bijdrage helpt de jongens hun droomreis te maken.
        </p>
      </div>

      {/* Amounts */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-3xl font-black font-headline text-primary-container">
            {formatEuro(raised)}
          </span>
          <span className="text-sm text-on-surface-variant ml-2">ingezameld</span>
        </div>
        <span className="text-sm font-bold text-on-surface-variant">
          doel: {formatEuro(goal)}
        </span>
      </div>

      {/* Thermometer */}
      <div className="mb-4">
        <div className="h-3 rounded-full overflow-hidden bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary-container transition-all duration-1000 ease-out"
            style={{ width: `${animatedPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs font-bold text-primary-container">{percent}%</span>
          <span className="text-xs text-on-surface-variant">{formatEuro(goal)}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => window.open(tikkieUrl, "_blank", "noopener,noreferrer")}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        Doneer Nu
        <ExternalLink size={14} />
      </button>
      <p className="text-center text-[11px] text-on-surface-variant mt-2">
        Veilig betalen via Tikkie
      </p>
    </div>
  );
}
