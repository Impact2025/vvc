"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Vrijdag 29 mei 2026, 08:00 — vertrek richting Londen
const TARGET = new Date("2026-05-29T08:00:00");

function calcTimeLeft(): TimeLeft {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Pad({ n }: { n: number }) {
  return <>{String(n).padStart(2, "0")}</>;
}

export default function Countdown() {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calcTimeLeft());
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const gone = time && time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  return (
    <div className="card card-hover p-5 flex flex-col justify-between h-full">
      {/* label */}
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">Aftellen</p>
        <Plane size={16} className="text-primary-container" />
      </div>

      {gone ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
          <span className="text-4xl mb-1">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
          <p className="font-headline font-black text-primary-container text-lg">We're off!</p>
          <p className="text-xs text-on-surface-variant mt-1">London Tour gestart</p>
        </div>
      ) : (
        <>
          {/* Big number: days */}
          <div className="mb-3">
            <span className="text-6xl font-black font-headline text-on-surface tabular-nums leading-none">
              {time ? <Pad n={time.days} /> : "––"}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-2">
              {time?.days === 1 ? "dag" : "dagen"}
            </span>
          </div>

          {/* H : M : S row */}
          <div className="flex items-center gap-1.5">
            {[
              { val: time?.hours, label: "u" },
              { val: time?.minutes, label: "m" },
              { val: time?.seconds, label: "s" },
            ].map(({ val, label }, i) => (
              <div key={label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-outline font-bold text-sm">:</span>}
                <div className="bg-surface-container rounded-lg px-2.5 py-1.5 text-center min-w-[2.5rem]">
                  <span className="text-base font-black font-headline tabular-nums text-on-surface">
                    {val !== undefined ? <Pad n={val} /> : "––"}
                  </span>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-outline leading-none mt-0.5">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Date label */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mt-3">
            29 mei · vertrek Londen
          </p>
        </>
      )}
    </div>
  );
}
