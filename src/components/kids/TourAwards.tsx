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

const awardColors: Record<string, string> = {
  "🔥 Beste Inzet": "from-orange-400 to-red-500",
  "🤝 Fair Play": "from-green-400 to-emerald-500",
  "😂 Grappigste Speler": "from-yellow-400 to-amber-500",
  "🦁 Dapperste Speler": "from-amber-500 to-orange-600",
  "🎯 Meeste Kansen": "from-blue-400 to-indigo-500",
  "🌟 Beste Verdediger": "from-violet-400 to-purple-500",
  "🏃 Snelste Speler": "from-cyan-400 to-sky-500",
  "🧤 Beste Keeper": "from-teal-400 to-green-600",
};

export default function TourAwards({ players }: { players: Player[] }) {
  const winners = players.filter((p) => p.award);
  if (winners.length === 0) return null;

  return (
    <section className="mb-12">
      <p className="section-label mb-5">Tour Awards</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {winners.map((player) => {
          const label = player.award!;
          const emoji = awardEmoji[label] ?? "🏅";
          const gradient = awardColors[label] ?? "from-gray-400 to-gray-500";
          const title = label.replace(/^\S+\s/, ""); // strip emoji prefix

          return (
            <div
              key={player.id}
              className="rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10"
            >
              <div className={`bg-gradient-to-br ${gradient} p-4 flex flex-col items-center text-center`}>
                <span className="text-4xl mb-1">{emoji}</span>
                <p className="text-white font-black text-xs uppercase tracking-wider leading-tight">
                  {title}
                </p>
              </div>
              <div className="bg-white px-3 py-3 text-center">
                <p className="font-headline font-black text-sm text-on-surface leading-tight">
                  {player.name}
                </p>
                {player.number && (
                  <p className="text-[10px] text-outline mt-0.5">#{player.number}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
