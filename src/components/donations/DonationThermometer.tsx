"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { formatEuro } from "@/lib/utils";

interface Props {
  raised: number; // cents
  goal: number;   // cents
  tikkieUrl: string;
}

const MILESTONES = [
  { pct: 25, label: "Vliegtickets" },
  { pct: 50, label: "Hotel" },
  { pct: 75, label: "Maaltijden" },
  { pct: 100, label: "Doel bereikt 🎉" },
];

export default function DonationThermometer({ raised, goal, tikkieUrl }: Props) {
  const [width, setWidth] = useState(0);
  const pct = Math.min(100, Math.round((raised / goal) * 100));

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="card p-6 sm:p-8">
      {/* Amounts */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="section-label mb-0.5">Opgehaald</p>
          <p className="text-4xl font-black font-headline text-on-surface tabular-nums">
            {formatEuro(raised)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-on-surface-variant font-medium">doel</p>
          <p className="text-lg font-bold font-headline text-on-surface-variant">
            {formatEuro(goal)}
          </p>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-4 bg-surface-container-high rounded-full overflow-visible mb-6">
        {/* Milestone ticks */}
        {MILESTONES.map((m) => (
          <div
            key={m.pct}
            className="absolute top-0 bottom-0 w-px bg-white/60 z-10"
            style={{ left: `${m.pct}%` }}
          />
        ))}
        {/* Fill */}
        <div
          className="h-full rounded-full bg-primary-container transition-all duration-1000 ease-out relative"
          style={{ width: `${width}%` }}
        >
          {/* Glow dot at tip */}
          {width > 2 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary-container shadow-[0_0_10px_3px_rgba(244,121,32,0.5)] border-2 border-white" />
          )}
        </div>
      </div>

      {/* Milestone labels */}
      <div className="relative h-5 mb-6">
        {MILESTONES.map((m) => (
          <div
            key={m.pct}
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${m.pct}%` }}
          >
            <span
              className={`text-[9px] font-bold uppercase tracking-wide whitespace-nowrap ${
                pct >= m.pct ? "text-primary-container" : "text-outline"
              }`}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => window.open(tikkieUrl, "_blank", "noopener,noreferrer")}
        className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base"
      >
        Doneer via Tikkie <ExternalLink size={16} />
      </button>

      <p className="text-center text-[11px] text-outline mt-3">
        Veilig betalen via iDEAL · {pct}% van het doel bereikt
      </p>
    </div>
  );
}
