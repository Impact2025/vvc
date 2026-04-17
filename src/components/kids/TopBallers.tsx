import { Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Player } from "@/db/schema";

interface TopBallersProps {
  players: Player[];
}

function RankingList({
  title,
  icon: Icon,
  players,
  stat,
}: {
  title: string;
  icon: React.ElementType;
  players: Player[];
  stat: "goals" | "assists";
}) {
  const sorted = [...players]
    .filter((p) => (p[stat] ?? 0) > 0)
    .sort((a, b) => (b[stat] ?? 0) - (a[stat] ?? 0))
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-primary-container" />
        <h3 className="font-headline font-black text-sm uppercase tracking-wider text-on-surface">
          {title}
        </h3>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="text-xs text-on-surface-variant">Nog geen {stat} geregistreerd.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((player, i) => (
            <div
              key={player.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                i === 0
                  ? "border-l-4 border-l-primary-container border-outline-variant/15 bg-surface-container-lowest"
                  : "border-outline-variant/10 bg-surface-container-low"
              )}
            >
              {/* Rank */}
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black font-headline flex-shrink-0",
                  i === 0
                    ? "bg-primary-container text-white"
                    : "bg-surface-container-highest text-on-surface-variant"
                )}
              >
                {i + 1}
              </span>

              {/* Name + number */}
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-sm text-on-surface truncate">
                  {player.name}
                </p>
                {player.number && (
                  <p className="text-[10px] text-outline">#{player.number}</p>
                )}
              </div>

              {/* Stat value */}
              <span
                className={cn(
                  "font-black font-headline tabular-nums",
                  i === 0 ? "text-primary-container text-lg" : "text-on-surface text-base"
                )}
              >
                {player[stat] ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopBallers({ players }: TopBallersProps) {
  return (
    <div>
      <p className="section-label mb-5">Top Ballers</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <RankingList
          title="Topscorers"
          icon={Trophy}
          players={players}
          stat="goals"
        />
        <RankingList
          title="Assists"
          icon={Target}
          players={players}
          stat="assists"
        />
      </div>
    </div>
  );
}
