import type { Player } from "@/db/schema";

const awardEmoji: Record<string, string> = {
  "🔥 Beste Inzet": "🔥",
  "🤝 Fair Play": "🤝",
  "😂 Grappigste Speler": "😂",
  "🦁 Dapperste Speler": "🦁",
  "🎯 Meeste Kansen": "🎯",
  "🌟 Beste Verdediger": "🌟",
  "🏃 Snelste Speler": "🏃",
  "🧤 Beste Keeper": "🧤",
};

export default function TourAwards({ players }: { players: Player[] }) {
  const winners = players.filter((p) => p.award);
  if (winners.length === 0) return null;

  return (
    <section className="mb-12">
      <p className="section-label mb-5">Tour Awards</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {winners.map((player) => {
          const label = player.award!;
          const emoji = awardEmoji[label] ?? "🏅";
          const title = label.replace(/^\S+\s/, "");

          return (
            <div key={player.id} className="card p-4 flex items-center gap-3">
              <span className="text-2xl shrink-0">{emoji}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-outline uppercase tracking-widest mb-0.5 truncate">
                  {title}
                </p>
                <p className="font-headline font-black text-sm text-on-surface">
                  {player.name}
                </p>
                {player.number && (
                  <p className="text-[10px] text-outline">#{player.number}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
