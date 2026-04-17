"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Player {
  id: number;
  name: string;
  number: number | null;
  goals: number | null;
  assists: number | null;
  photo_url: string | null;
  position: string | null;
  award: string | null;
}

const emptyForm = () => ({ name: "", number: "", positions: [] as string[] });
const positions = ["Keeper", "Verdediger", "Middenvelder", "Aanvaller"];

const positionColors: Record<string, string> = {
  Keeper: "bg-yellow-100 text-yellow-800",
  Verdediger: "bg-blue-100 text-blue-800",
  Middenvelder: "bg-green-100 text-green-800",
  Aanvaller: "bg-red-100 text-red-800",
};

function PositionPicker({ player, onSave }: { player: Player; onSave: (id: number, pos: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = player.position ? player.position.split(", ").filter(Boolean) : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(pos: string) {
    const next = selected.includes(pos) ? selected.filter((p) => p !== pos) : [...selected, pos];
    onSave(player.id, next.join(", "));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex flex-wrap gap-1 items-center min-w-[80px] text-left"
      >
        {selected.length === 0 ? (
          <span className="text-xs text-outline italic">Kies…</span>
        ) : (
          selected.map((p) => (
            <span key={p} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${positionColors[p] ?? "bg-surface-container text-on-surface"}`}>
              {p}
            </span>
          ))
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-outline-variant/20 p-2 min-w-[150px]">
          {positions.map((pos) => (
            <label key={pos} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-container-low cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(pos)}
                onChange={() => toggle(pos)}
                className="accent-orange-500"
              />
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${positionColors[pos]}`}>{pos}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
const awards = [
  "🔥 Beste Inzet",
  "🤝 Fair Play",
  "😂 Grappigste Speler",
  "🦁 Dapperste Speler",
  "🎯 Meeste Kansen",
  "🌟 Beste Verdediger",
  "🏃 Snelste Speler",
  "🧤 Beste Keeper",
];

export default function SpelersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploadPlayerId, setPhotoUploadPlayerId] = useState<number | null>(null);

  const fetchPlayers = useCallback(async () => {
    try {
      const res = await fetch("/api/players");
      const data = await res.json();
      setPlayers(data);
    } catch {
      toast.error("Kan spelers niet laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          number: form.number ? parseInt(form.number) : null,
          position: form.positions.length > 0 ? form.positions.join(", ") : null,
          goals: 0,
          assists: 0,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Speler toegevoegd");
      setForm(emptyForm());
      setShowForm(false);
      fetchPlayers();
    } catch {
      toast.error("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleStatChange = async (player: Player, field: "goals" | "assists", delta: number) => {
    const currentVal = player[field] ?? 0;
    const newVal = Math.max(0, currentVal + delta);
    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newVal }),
      });
      if (!res.ok) throw new Error();
      setPlayers((prev) =>
        prev.map((p) => (p.id === player.id ? { ...p, [field]: newVal } : p))
      );
    } catch {
      toast.error("Opslaan mislukt");
    }
  };

  const handlePositionChange = async (id: number, position: string) => {
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: position || null }),
      });
      if (!res.ok) throw new Error();
      setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, position: position || null } : p)));
      toast.success("Positie opgeslagen");
    } catch {
      toast.error("Opslaan mislukt");
    }
  };

  const handleAwardChange = async (player: Player, award: string) => {
    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ award: award || null }),
      });
      if (!res.ok) throw new Error();
      setPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, award: award || null } : p)));
      toast.success(award ? "Award ingesteld" : "Award verwijderd");
    } catch {
      toast.error("Opslaan mislukt");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Speler verwijderen?")) return;
    try {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Speler verwijderd");
      fetchPlayers();
    } catch {
      toast.error("Verwijderen mislukt");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, playerId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhotoId(playerId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload mislukt");
      const { url } = await uploadRes.json();

      const patchRes = await fetch(`/api/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: url }),
      });
      if (!patchRes.ok) throw new Error("Opslaan mislukt");
      toast.success("Foto opgeslagen");
      fetchPlayers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploadingPhotoId(null);
      setPhotoUploadPlayerId(null);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline text-secondary">Spelers</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Beheer het team en statistieken.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {showForm ? "Annuleren" : "+ Speler toevoegen"}
        </button>
      </div>

      {/* Add player form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Nieuwe speler</p>
          <form onSubmit={handleAddPlayer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Naam *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Rugnummer</label>
              <input type="number" min="1" max="99" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Positie(s)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {positions.map((pos) => (
                  <label key={pos} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.positions.includes(pos)}
                      onChange={() => setForm((f) => ({
                        ...f,
                        positions: f.positions.includes(pos) ? f.positions.filter((p) => p !== pos) : [...f.positions, pos],
                      }))}
                      className="accent-orange-500"
                    />
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${positionColors[pos]}`}>{pos}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); }} className="px-5 py-2.5 rounded-lg border border-outline-variant/30 text-sm font-semibold text-on-surface-variant">Annuleren</button>
              <button type="submit" disabled={saving} className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Opslaan..." : "Toevoegen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players table */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Spelerslijst ({players.length})
        </p>
        {loading ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Laden...</p>
        ) : players.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Geen spelers gevonden.</p>
        ) : (
          <div className="overflow-x-auto">
            {/* Hidden file input for photo upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (photoUploadPlayerId !== null) {
                  handlePhotoUpload(e, photoUploadPlayerId);
                }
              }}
            />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs w-12">#</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Speler</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Positie</th>
                  <th className="text-center py-2 pr-4 font-semibold text-on-surface-variant text-xs">Goals</th>
                  <th className="text-center py-2 pr-4 font-semibold text-on-surface-variant text-xs">Assists</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Award</th>
                  <th className="text-right py-2 font-semibold text-on-surface-variant text-xs">Acties</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50">
                    <td className="py-3 pr-4">
                      <span className="font-mono font-bold text-outline">{player.number ?? "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container overflow-hidden shrink-0 relative">
                          {player.photo_url ? (
                            <Image src={player.photo_url} alt={player.name} fill className="object-cover" sizes="36px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-xs font-bold">
                              {player.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-on-surface">{player.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <PositionPicker player={player} onSave={handlePositionChange} />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleStatChange(player, "goals", -1)} className="w-6 h-6 rounded border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container text-sm leading-none flex items-center justify-center font-bold">−</button>
                        <span className="text-on-surface font-bold w-5 text-center">{player.goals ?? 0}</span>
                        <button onClick={() => handleStatChange(player, "goals", 1)} className="w-6 h-6 rounded border border-outline-variant/30 text-primary-container hover:bg-primary-container/10 text-sm leading-none flex items-center justify-center font-bold">+</button>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleStatChange(player, "assists", -1)} className="w-6 h-6 rounded border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container text-sm leading-none flex items-center justify-center font-bold">−</button>
                        <span className="text-on-surface font-bold w-5 text-center">{player.assists ?? 0}</span>
                        <button onClick={() => handleStatChange(player, "assists", 1)} className="w-6 h-6 rounded border border-outline-variant/30 text-primary-container hover:bg-primary-container/10 text-sm leading-none flex items-center justify-center font-bold">+</button>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={player.award ?? ""}
                        onChange={(e) => handleAwardChange(player, e.target.value)}
                        className="text-xs border border-outline-variant/30 rounded-lg px-2 py-1.5 bg-white focus:border-primary-container focus:outline-none max-w-[160px]"
                      >
                        <option value="">— geen —</option>
                        {awards.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setPhotoUploadPlayerId(player.id);
                            setTimeout(() => fileInputRef.current?.click(), 50);
                          }}
                          disabled={uploadingPhotoId === player.id}
                          className="text-xs border border-outline-variant/30 text-on-surface-variant px-3 py-1.5 rounded font-semibold hover:bg-surface-container-low disabled:opacity-50"
                        >
                          {uploadingPhotoId === player.id ? "Uploaden..." : "Foto"}
                        </button>
                        <button onClick={() => handleDelete(player.id)} className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded font-semibold hover:bg-red-50">
                          Verwijder
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
