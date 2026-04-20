"use client";

import { useState } from "react";

interface Player {
  name: string;
  position: string;
  number: number;
  photo: string | null;
  photoPosition?: string;
  emoji: string;
  qna: { q: string; a: string }[];
}

const TEAM: Player[] = [
  {
    name: "Wesley",
    position: "Aanvaller",
    number: 9,
    photo: "/photos/players/wesley.jpg",
    emoji: "⚡",
    qna: [
      { q: "Favoriete voetballer?", a: "Erling Haaland" },
      { q: "Wat ga je als eerste doen in Londen?", a: "De Big Ben zien!" },
    ],
  },
  {
    name: "Tyren",
    position: "Middenvelder",
    number: 8,
    photo: "/photos/players/tyren.jpg",
    emoji: "🎯",
    qna: [
      { q: "Favoriete voetballer?", a: "Rodri" },
      { q: "Wat ga je als eerste doen in Londen?", a: "Lekker eten" },
    ],
  },
  {
    name: "Sepp",
    position: "Verdediger",
    number: 1,
    photo: "/photos/players/sepp.jpg",
    emoji: "🛡️",
    qna: [
      { q: "Favoriete voetballer?", a: "Virgil van Dijk" },
      { q: "Wat ga je als eerste doen in Londen?", a: "De muur zijn!" },
    ],
  },
  {
    name: "Kayne",
    position: "Keeper",
    number: 12,
    photo: "/photos/players/kayne.jpg",
    emoji: "🧤",
    qna: [
      { q: "Favoriete voetballer?", a: "Manuel Neuer" },
      { q: "Wat ga je als eerste doen in Londen?", a: "Voetballen uiteraard" },
    ],
  },
  {
    name: "Deniz",
    position: "Aanvaller",
    number: 5,
    photo: "/photos/players/deniz.jpg",
    emoji: "⚡",
    qna: [
      { q: "Favoriete voetballer?", a: "Erling Haaland" },
      { q: "Wat ga je als eerste doen in Londen?", a: "Scoren natuurlijk!" },
    ],
  },
  {
    name: "Syb",
    position: "Aanvaller",
    number: 11,
    photo: "/photos/players/syb.jpg",
    emoji: "🚀",
    qna: [
      { q: "Favoriete voetballer?", a: "Kylian Mbappé" },
      { q: "Wat ga je als eerste doen in Londen?", a: "Rennen door de stad" },
    ],
  },
  {
    name: "Alex",
    position: "Middenvelder",
    number: 6,
    photo: "/photos/players/alex.jpg",
    emoji: "🎮",
    qna: [
      { q: "Favoriete voetballer?", a: "Kevin De Bruyne" },
      { q: "Wat ga je als eerste doen in Londen?", a: "Wembley bezoeken" },
    ],
  },
  {
    name: "Emersen",
    position: "Aanvaller",
    number: 7,
    photo: "/photos/players/emerson.jpg",
    photoPosition: "center 25%",
    emoji: "⭐",
    qna: [
      { q: "Favoriete voetballer?", a: "Sam Kerr" },
      { q: "Wat ga je als eerste doen in Londen?", a: "Shoppen!" },
    ],
  },
];

function PlayerCard({ player }: { player: Player }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped((v) => !v)}
    >
      <div
        className="relative transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "340px",
        }}
      >
        {/* Voorkant: foto */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden bg-surface-container"
          style={{ backfaceVisibility: "hidden" }}
        >
          {player.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photo}
              alt={player.name}
              className="w-full h-full object-cover"
              style={{ objectPosition: player.photoPosition ?? "center top" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-fixed/30">
              <div className="text-center">
                <span className="text-6xl block mb-2">📸</span>
                <p className="text-xs text-on-surface-variant font-bold">Foto volgt</p>
              </div>
            </div>
          )}
          {/* Gradient overlay + naam */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white font-headline font-black text-lg leading-tight">
                  {player.name}
                </p>
                <p className="text-white/70 text-xs font-bold">{player.position}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center">
                <span className="text-white font-headline font-black text-sm">#{player.number}</span>
              </div>
            </div>
          </div>
          {/* Flip hint */}
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] text-white/80 font-bold">
            Tik ›
          </div>
        </div>

        {/* Achterkant: interview */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-container to-secondary p-5 flex flex-col"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{player.emoji}</span>
            <div>
              <p className="text-white font-headline font-black text-base leading-tight">{player.name}</p>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{player.position} · #{player.number}</p>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {player.qna.map(({ q, a }) => (
              <div key={q}>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-wider mb-0.5">{q}</p>
                <p className="text-white font-bold text-sm leading-snug">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-[10px] text-center mt-4">Tik om terug te draaien</p>
        </div>
      </div>
    </div>
  );
}

export default function TeamSection() {
  return (
    <section className="mb-14">
      <p className="section-label mb-2">Het Team</p>
      <h2 className="text-2xl font-black font-headline text-on-surface mb-1">
        Maak kennis met de <span className="text-primary-container">Little Lions</span>
      </h2>
      <p className="text-sm text-on-surface-variant mb-6">
        Tik op een kaart om het interview te lezen
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {TEAM.map((player) => (
          <PlayerCard key={player.name} player={player} />
        ))}
      </div>
    </section>
  );
}
