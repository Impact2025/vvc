"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera, BookOpen, LogOut, CheckCircle, X,
  Upload, Clock, Image as ImageIcon, ChevronRight, Trash2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import type { ParentSession } from "@/lib/parentSession";

interface Props {
  parent: ParentSession;
  matches: { id: number; opponent: string }[];
}

interface Photo {
  id: number;
  url: string;
  caption: string | null;
  approved: boolean | null;
  created_at: string | null;
}

function Initials({ naam }: { naam: string }) {
  const parts = naam.trim().split(" ");
  const init = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return <>{init.toUpperCase()}</>;
}

type Tab = "home" | "fotos" | "dagboek" | "scores";

export default function MijnDashboard({ parent, matches }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [myPhotos, setMyPhotos] = useState<Photo[]>([]);
  const [photosLoaded, setPhotosLoaded] = useState(false);

  useEffect(() => {
    if (tab === "fotos" && !photosLoaded) {
      fetch("/api/mijn/fotos")
        .then((r) => r.json())
        .then((data) => { setMyPhotos(data); setPhotosLoaded(true); });
    }
  }, [tab, photosLoaded]);

  const logout = async () => {
    await fetch("/api/ouders/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="pt-6">
      <Toaster position="top-center" />
      {/* Profile hero */}
      <div className="bg-white border border-outline-variant/15 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-xl"><Initials naam={parent.naam} /></span>
            </div>
            <div>
              <h1 className="text-xl font-black font-headline text-on-surface">{parent.naam}</h1>
              {parent.kind_naam && (
                <p className="text-sm text-on-surface-variant">Ouder van <span className="font-semibold text-primary-container">{parent.kind_naam}</span></p>
              )}
              <p className="text-xs text-outline mt-0.5 capitalize">{parent.rol ?? "Ouder"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant border border-outline-variant/20 rounded-lg px-3 py-2 hover:bg-surface-container transition-colors"
          >
            <LogOut size={13} />
            Uitloggen
          </button>
        </div>

        {/* Permissions badges */}
        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${parent.kan_fotos_uploaden ? "bg-green-100 text-green-700" : "bg-surface-container text-outline"}`}>
            {parent.kan_fotos_uploaden ? "✓" : "✗"} Foto's uploaden
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${parent.kan_commentaar ? "bg-green-100 text-green-700" : "bg-surface-container text-outline"}`}>
            {parent.kan_commentaar ? "✓" : "✗"} Reageren
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 bg-surface-container rounded-xl p-1">
        {([
          { key: "home", label: "Dashboard", icon: "🏠" },
          { key: "fotos", label: "Mijn Foto's", icon: "📸" },
          { key: "dagboek", label: "Dagboek", icon: "📔" },
          ...(parent.kan_scores_bijhouden ? [{ key: "scores", label: "Scores", icon: "⚽" }] : []),
        ] as { key: Tab; label: string; icon: string }[]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${tab === key ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant"}`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "home" && <HomeTab parent={parent} onNavigate={setTab} />}
      {tab === "fotos" && <FotosTab parent={parent} matches={matches} photos={myPhotos} onUploaded={() => setPhotosLoaded(false)} />}
      {tab === "dagboek" && <DagboekTab parent={parent} />}
      {tab === "scores" && parent.kan_scores_bijhouden && <ScoresTab />}
    </div>
  );
}

/* ─── Home Tab ──────────────────────────────────────────────────────────── */
function HomeTab({ parent, onNavigate }: { parent: ParentSession; onNavigate: (t: Tab) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <ActionCard
          emoji="📸"
          title="Foto uploaden"
          desc="Deel een moment van de tour"
          locked={!parent.kan_fotos_uploaden}
          onClick={() => onNavigate("fotos")}
        />
        <ActionCard
          emoji="📔"
          title="Dagboek"
          desc={parent.kind_naam ? `Schrijf voor ${parent.kind_naam}` : "Schrijf een entry"}
          onClick={() => onNavigate("dagboek")}
        />
      </div>

      <div className="bg-white border border-outline-variant/15 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Snelle links</p>
        <div className="space-y-1">
          {[
            { href: "/live", label: "Live wedstrijd", emoji: "🔴" },
            { href: "/schema", label: "Wedstrijdschema", emoji: "📅" },
            { href: "/fotos", label: "Alle foto's", emoji: "🖼️" },
            { href: "/londen", label: "Londen kaart", emoji: "🗺️" },
          ].map(({ href, label, emoji }) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface-container transition-colors group"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-on-surface">
                <span className="text-base">{emoji}</span>
                {label}
              </span>
              <ChevronRight size={14} className="text-outline group-hover:text-on-surface transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ emoji, title, desc, locked, onClick }: {
  emoji: string; title: string; desc: string; locked?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`bg-white border border-outline-variant/15 rounded-2xl p-5 shadow-sm text-left w-full transition-all ${locked ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:border-primary-container/30 active:scale-[0.98]"}`}
    >
      <span className="text-2xl block mb-2">{emoji}</span>
      <p className="font-bold text-sm text-on-surface">{title}</p>
      <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
      {locked && <p className="text-xs text-orange-500 mt-1 font-medium">Vraag toestemming</p>}
    </button>
  );
}

/* ─── Fotos Tab ─────────────────────────────────────────────────────────── */
function FotosTab({
  parent, matches, photos, onUploaded,
}: {
  parent: ParentSession;
  matches: { id: number; opponent: string }[];
  photos: Photo[];
  onUploaded: () => void;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Foto verwijderen?")) return;
    setDeletingId(id);
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    setDeletingId(null);
    onUploaded();
  }

  return (
    <div>
      {parent.kan_fotos_uploaden && (
        <button
          onClick={() => setShowUpload(true)}
          className="w-full flex items-center justify-center gap-2 bg-primary-container text-white font-bold rounded-2xl py-3.5 mb-5 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Camera size={18} />
          Foto uploaden
        </button>
      )}

      {photos.length === 0 ? (
        <div className="bg-white border border-outline-variant/15 rounded-2xl p-12 text-center shadow-sm">
          <ImageIcon size={40} className="text-outline mx-auto mb-3" />
          <p className="font-bold text-on-surface">Nog geen foto's ingediend</p>
          <p className="text-xs text-on-surface-variant mt-1">Upload je eerste foto hierboven</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative rounded-2xl overflow-hidden aspect-square bg-surface-container">
              <Image src={p.url} alt={p.caption ?? "foto"} fill className="object-cover" />
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {p.approved ? (
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Goedgekeurd
                  </span>
                ) : (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={10} /> In behandeling
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                title="Verwijderen"
              >
                <Trash2 size={13} className="text-white" />
              </button>
              {p.caption && (
                <div className="absolute bottom-0 left-0 right-10 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs line-clamp-1">{p.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal
          parentId={parent.id}
          parentNaam={parent.naam}
          matches={matches}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); onUploaded(); }}
        />
      )}
    </div>
  );
}

/* ─── Upload Modal ──────────────────────────────────────────────────────── */
function UploadModal({ parentId, parentNaam, matches, onClose, onSuccess }: {
  parentId: number; parentNaam: string;
  matches: { id: number; opponent: string }[];
  onClose: () => void; onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [matchId, setMatchId] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus("uploading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error();
      const { url } = await uploadRes.json();
      const saveRes = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: caption.trim() || null, uploader_name: parentNaam, uploader_parent_id: parentId, match_id: matchId ? parseInt(matchId) : null }),
      });
      if (!saveRes.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center p-4 pb-20 sm:pb-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-outline-variant/10">
          <h2 className="font-headline font-bold text-on-surface">Foto uploaden</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          {status === "done" ? (
            <div className="text-center py-6">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
              <p className="font-bold text-on-surface text-lg">Geplaatst!</p>
              <p className="text-sm text-on-surface-variant mt-1 mb-5">Wordt goedgekeurd door de beheerder.</p>
              <button onClick={onSuccess} className="bg-primary-container text-white font-bold rounded-xl px-6 py-2.5 text-sm">Sluiten</button>
            </div>
          ) : (
            <>
              <label
                htmlFor="mijn-foto-input"
                className="border-2 border-dashed border-outline-variant/40 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-primary-container/60 hover:bg-surface-container/30 transition-colors mb-4 overflow-hidden relative"
              >
                {preview ? (
                  <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={28} className="text-outline mb-2" />
                    <p className="text-sm font-semibold text-on-surface-variant">Tik om foto te kiezen</p>
                    <p className="text-xs text-outline mt-1">JPG, PNG of HEIC</p>
                  </>
                )}
              </label>
              <input id="mijn-foto-input" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <input type="text" placeholder="Bijschrift (optioneel)" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm mb-3 focus:border-primary-container focus:outline-none" />
              <select value={matchId} onChange={(e) => setMatchId(e.target.value)} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm mb-4 focus:border-primary-container focus:outline-none">
                <option value="">Geen wedstrijd gekoppeld</option>
                {matches.map((m) => <option key={m.id} value={m.id}>VVC vs {m.opponent}</option>)}
              </select>
              <button onClick={handleSubmit} disabled={!file || status === "uploading"} className="w-full bg-primary-container text-white font-bold rounded-xl py-3 text-sm disabled:opacity-50">
                {status === "uploading" ? "Uploaden..." : "Plaatsen"}
              </button>
              {status === "error" && <p className="text-red-500 text-xs text-center mt-3">Upload mislukt. Probeer opnieuw.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Dagboek Tab ───────────────────────────────────────────────────────── */
function DagboekTab({ parent }: { parent: ParentSession }) {
  const [day, setDay] = useState("1");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus("saving");
    setErrorMsg("");
    const res = await fetch("/api/mijn/dagboek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, day: parseInt(day) }),
    });
    if (res.ok) {
      setStatus("done");
      setContent("");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Opslaan mislukt");
      setStatus("error");
    }
  };

  if (!parent.kind_naam) {
    return (
      <div className="bg-white border border-outline-variant/15 rounded-2xl p-10 text-center shadow-sm">
        <BookOpen size={36} className="text-outline mx-auto mb-3" />
        <p className="font-bold text-on-surface">Geen kind gekoppeld</p>
        <p className="text-xs text-on-surface-variant mt-1">Vraag de beheerder om je account te koppelen.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-outline-variant/15 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={18} className="text-primary-container" />
          <h2 className="font-black font-headline text-on-surface">Tour Dagboek</h2>
        </div>
        <p className="text-sm text-on-surface-variant">Schrijf een beleving voor <span className="font-semibold text-primary-container">{parent.kind_naam}</span></p>
      </div>

      {status === "done" ? (
        <div className="px-6 py-10 text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <p className="font-bold text-on-surface text-lg">Entry opgeslagen!</p>
          <p className="text-sm text-on-surface-variant mt-1 mb-5">Zichtbaar in de Kids sectie.</p>
          <div className="flex gap-3 justify-center">
            <a href="/kids" className="bg-primary-container text-white font-bold rounded-xl px-5 py-2.5 text-sm">
              Bekijk dagboek →
            </a>
            <button onClick={() => setStatus("idle")} className="border border-outline-variant/30 text-on-surface-variant font-bold rounded-xl px-5 py-2.5 text-sm">
              Nog een entry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Day selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Dag</label>
            <div className="flex gap-2">
              {["1", "2", "3", "4", "5"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${day === d ? "bg-primary-container text-white shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Wat beleefde {parent.kind_naam} vandaag?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Beschrijf de beleving van ${parent.kind_naam} op dag ${day}...`}
              rows={5}
              required
              className="w-full border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:border-primary-container focus:outline-none resize-none leading-relaxed"
            />
            <p className="text-xs text-outline mt-1 text-right">{content.length} tekens</p>
          </div>

          {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}

          <button
            type="submit"
            disabled={!content.trim() || status === "saving"}
            className="w-full bg-primary-container text-white font-bold rounded-xl py-3 text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {status === "saving" ? "Opslaan..." : "Entry opslaan"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ─── Scores Tab ────────────────────────────────────────────────────────────── */
interface MatchFull {
  id: number;
  opponent: string;
  date: string;
  time: string | null;
  location: string | null;
  home_score: number;
  away_score: number;
  status: string;
}

type ScoreUpdate = Partial<Pick<MatchFull, "home_score" | "away_score" | "status">>;

const SCORE_STATUS = [
  { value: "upcoming", label: "Gepland", active: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "live",     label: "● Live",  active: "bg-green-500 text-white border-green-500" },
  { value: "finished", label: "Gespeeld", active: "bg-surface-container text-on-surface-variant border-outline-variant/20" },
];

function isMatchToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function ScoreMatchCard({ match, saving, onUpdate }: { match: MatchFull; saving: boolean; onUpdate: (d: ScoreUpdate) => void }) {
  const opponentShort = match.opponent.split(" ").slice(0, 2).join(" ");
  return (
    <div className={`bg-white border-2 rounded-2xl shadow-sm overflow-hidden transition-opacity ${match.status === "live" ? "border-green-400" : "border-outline-variant/15"} ${saving ? "opacity-60" : ""}`}>
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{match.time ?? ""}  {match.location ? `· ${match.location}` : ""}</span>
          {saving && <span className="text-xs text-primary-container font-semibold">Opslaan…</span>}
        </div>
        <p className="font-black text-on-surface mt-0.5">VVC <span className="font-normal text-on-surface-variant">vs</span> {match.opponent}</p>
      </div>

      {/* Status */}
      <div className="px-5 py-3 flex gap-2">
        {SCORE_STATUS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => match.status !== opt.value && onUpdate({ status: opt.value })}
            disabled={saving}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${match.status === opt.value ? opt.active : "text-on-surface-variant border-outline-variant/15"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Score knoppen */}
      <div className="px-5 pb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="text-xs font-bold text-on-surface-variant text-center mb-2">VVC</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdate({ home_score: Math.max(0, match.home_score - 1) })}
              disabled={saving || match.home_score === 0}
              className="w-12 h-12 rounded-xl bg-surface-container text-xl font-bold text-on-surface-variant active:bg-surface-container-high disabled:opacity-30 flex items-center justify-center"
            >−</button>
            <span className="flex-1 text-center text-5xl font-black text-on-surface tabular-nums">{match.home_score}</span>
            <button
              onClick={() => onUpdate({ home_score: match.home_score + 1 })}
              disabled={saving}
              className="w-12 h-12 rounded-xl bg-primary-container text-xl font-bold text-white active:opacity-80 flex items-center justify-center shadow-sm"
            >+</button>
          </div>
        </div>

        <span className="text-3xl font-black text-outline-variant mt-4">–</span>

        <div>
          <p className="text-xs font-bold text-on-surface-variant text-center mb-2">{opponentShort}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdate({ away_score: Math.max(0, match.away_score - 1) })}
              disabled={saving || match.away_score === 0}
              className="w-12 h-12 rounded-xl bg-surface-container text-xl font-bold text-on-surface-variant active:bg-surface-container-high disabled:opacity-30 flex items-center justify-center"
            >−</button>
            <span className="flex-1 text-center text-5xl font-black text-on-surface tabular-nums">{match.away_score}</span>
            <button
              onClick={() => onUpdate({ away_score: match.away_score + 1 })}
              disabled={saving}
              className="w-12 h-12 rounded-xl bg-surface-container text-xl font-bold text-on-surface-variant active:bg-surface-container-high flex items-center justify-center"
            >+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoresTab() {
  const [matches, setMatches] = useState<MatchFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchMatches = useCallback(async () => {
    const res = await fetch("/api/matches");
    const data: MatchFull[] = await res.json();
    const order: Record<string, number> = { live: 0, upcoming: 1, finished: 2 };
    data.sort((a, b) => {
      const at = isMatchToday(a.date) ? 0 : 1;
      const bt = isMatchToday(b.date) ? 0 : 1;
      if (at !== bt) return at - bt;
      const so = (order[a.status] ?? 3) - (order[b.status] ?? 3);
      if (so !== 0) return so;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const update = useCallback(async (id: number, data: ScoreUpdate) => {
    setSaving(id);
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Opgeslagen ✓", { duration: 1200 });
    } catch {
      toast.error("Opslaan mislukt");
      fetchMatches();
    } finally {
      setSaving(null);
    }
  }, [fetchMatches]);

  const todayMatches = matches.filter((m) => isMatchToday(m.date));
  const otherMatches = matches.filter((m) => !isMatchToday(m.date));

  if (loading) return <p className="text-center text-on-surface-variant py-12 text-sm">Laden…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black font-headline text-on-surface">Score bijhouden</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Wijzigingen gaan direct live <span className="text-green-600 font-bold">●</span></p>
        </div>
      </div>

      {todayMatches.length > 0 && (
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-container mb-3">Vandaag</p>
          <div className="space-y-4">
            {todayMatches.map((m) => (
              <ScoreMatchCard key={m.id} match={m} saving={saving === m.id} onUpdate={(d) => update(m.id, d)} />
            ))}
          </div>
        </section>
      )}

      {otherMatches.length > 0 && (
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Overige wedstrijden</p>
          <div className="space-y-4">
            {otherMatches.map((m) => (
              <div key={m.id}>
                <p className="text-xs text-on-surface-variant mb-1.5 ml-1">
                  {new Date(m.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
                </p>
                <ScoreMatchCard match={m} saving={saving === m.id} onUpdate={(d) => update(m.id, d)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <p className="text-center text-on-surface-variant py-12 text-sm">Geen wedstrijden gevonden.</p>
      )}
    </div>
  );
}
