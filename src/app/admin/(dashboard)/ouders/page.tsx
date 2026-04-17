"use client";

import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Parent {
  id: number;
  naam: string;
  email: string;
  telefoon: string | null;
  kind_naam: string | null;
  rol: string | null;
  toestemming_fotos: boolean | null;
  toestemming_app: boolean | null;
  kan_fotos_uploaden: boolean | null;
  kan_commentaar: boolean | null;
  goedgekeurd: boolean | null;
  created_at: string | null;
}

const emptyForm = { naam: "", email: "", telefoon: "", kind_naam: "", rol: "ouder" };

export default function OudersPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
    const [inviteLinks, setInviteLinks] = useState<Record<number, string>>({});
  const [generatingInvite, setGeneratingInvite] = useState<number | null>(null);
  const [pinModal, setPinModal] = useState<{ id: number; naam: string } | null>(null);
  const [newPin, setNewPin] = useState("");

  const fetchParents = useCallback(async () => {
    try {
      const res = await fetch("/api/parents");
      const data = await res.json();
      setParents(data);
    } catch {
      toast.error("Kan ouders niet laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.naam || !form.email || !form.kind_naam) {
      toast.error("Naam, e-mail en kindnaam zijn verplicht");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Ouder toegevoegd");
      setForm(emptyForm);
      setShowForm(false);
      fetchParents();
    } catch {
      toast.error("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (parent: Parent, field: keyof Parent, newValue: boolean) => {
    try {
      const res = await fetch(`/api/parents/${parent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error();
      setParents((prev) =>
        prev.map((p) => (p.id === parent.id ? { ...p, [field]: newValue } : p))
      );
    } catch {
      toast.error("Opslaan mislukt");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ouder verwijderen?")) return;
    try {
      const res = await fetch(`/api/parents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Ouder verwijderd");
      fetchParents();
    } catch {
      toast.error("Verwijderen mislukt");
    }
  };

  const handleGenerateInvite = async (parentId: number) => {
    setGeneratingInvite(parentId);
    try {
      const res = await fetch(`/api/parents/invite/${parentId}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setInviteLinks((prev) => ({ ...prev, [parentId]: url }));
      toast.success("Uitnodigingslink gegenereerd");
    } catch {
      toast.error("Link genereren mislukt");
    } finally {
      setGeneratingInvite(null);
    }
  };

  const handleSetPin = async () => {
    if (!pinModal) return;
    if (!/^\d{4}$/.test(newPin)) { toast.error("Pincode moet 4 cijfers zijn"); return; }
    try {
      const res = await fetch(`/api/parents/${pinModal.id}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Pincode ingesteld voor ${pinModal.naam}`);
      setPinModal(null);
      setNewPin("");
    } catch {
      toast.error("Opslaan mislukt");
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link gekopieerd");
    }).catch(() => {
      toast.error("Kopiëren mislukt");
    });
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? "bg-primary-container" : "bg-outline-variant/30"}`}
      role="switch"
      aria-checked={value}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
    </button>
  );

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline text-secondary">Ouders</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Beheer ouderaanmeldingen en toestemmingen.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {showForm ? "Annuleren" : "+ Ouder toevoegen"}
        </button>
      </div>

      {/* Add parent form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Ouder toevoegen</p>
          <form onSubmit={handleAddParent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Naam *</label>
              <input type="text" value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })} required className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">E-mail *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Telefoon</label>
              <input type="tel" value={form.telefoon} onChange={(e) => setForm({ ...form, telefoon: e.target.value })} className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Kind naam *</label>
              <input type="text" value={form.kind_naam} onChange={(e) => setForm({ ...form, kind_naam: e.target.value })} required className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Rol</label>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white">
                <option value="ouder">Ouder</option>
                <option value="begeleider">Begeleider</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="px-5 py-2.5 rounded-lg border border-outline-variant/30 text-sm font-semibold text-on-surface-variant">Annuleren</button>
              <button type="submit" disabled={saving} className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Opslaan..." : "Toevoegen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Parents table */}
      <div className="bg-white rounded-xl border border-outline-variant/15 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-sm text-on-surface-variant text-center py-12">Laden...</p>
        ) : parents.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-12">Nog geen ouders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-outline-variant/10">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs">Naam</th>
                  <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs">Kind</th>
                  <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs">Rol</th>
                  <th className="text-center px-4 py-3 font-semibold text-on-surface-variant text-xs">Goedgekeurd</th>
                  <th className="text-center px-4 py-3 font-semibold text-on-surface-variant text-xs">Foto's</th>
                  <th className="text-center px-4 py-3 font-semibold text-on-surface-variant text-xs">Reacties</th>
                  <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs">Acties</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((parent) => (
                  <tr key={parent.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-on-surface">{parent.naam}</p>
                        <p className="text-xs text-on-surface-variant">{parent.email}</p>
                        {parent.telefoon && <p className="text-xs text-outline">{parent.telefoon}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{parent.kind_naam ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-surface-container px-2 py-0.5 rounded font-semibold text-on-surface-variant capitalize">
                        {parent.rol ?? "ouder"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Toggle
                        value={parent.goedgekeurd ?? false}
                        onChange={(v) => handleToggle(parent, "goedgekeurd", v)}
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Toggle
                        value={parent.kan_fotos_uploaden ?? false}
                        onChange={(v) => handleToggle(parent, "kan_fotos_uploaden", v)}
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Toggle
                        value={parent.kan_commentaar ?? false}
                        onChange={(v) => handleToggle(parent, "kan_commentaar", v)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {inviteLinks[parent.id] ? (
                          <div className="flex items-center gap-1">
                            <input
                              readOnly
                              value={inviteLinks[parent.id]}
                              className="text-xs border border-outline-variant/20 rounded px-2 py-1 bg-surface-container-low w-40 truncate"
                            />
                            <button
                              onClick={() => handleCopyLink(inviteLinks[parent.id])}
                              className="text-xs bg-secondary text-white px-2 py-1 rounded font-semibold"
                            >
                              Kopieer
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateInvite(parent.id)}
                            disabled={generatingInvite === parent.id}
                            className="text-xs border border-secondary/30 text-secondary px-3 py-1.5 rounded font-semibold hover:bg-secondary/5 disabled:opacity-50"
                          >
                            {generatingInvite === parent.id ? "Genereren..." : "Uitnodiging"}
                          </button>
                        )}
                        <button
                          onClick={() => { setPinModal({ id: parent.id, naam: parent.naam }); setNewPin(""); }}
                          className="text-xs border border-outline-variant/30 text-on-surface-variant px-3 py-1.5 rounded font-semibold hover:bg-surface-container"
                        >
                          PIN
                        </button>
                        <button
                          onClick={() => handleDelete(parent.id)}
                          className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded font-semibold hover:bg-red-50"
                        >
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

      {/* PIN modal */}
      {pinModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs">
            <h2 className="font-bold text-on-surface mb-1">PIN instellen</h2>
            <p className="text-sm text-on-surface-variant mb-4">{pinModal.naam}</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4-cijferige PIN"
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-3 text-center text-2xl tracking-widest mb-4 focus:border-primary-container focus:ring-0"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setPinModal(null); setNewPin(""); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant/30 text-sm font-semibold text-on-surface-variant"
              >
                Annuleren
              </button>
              <button
                onClick={handleSetPin}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary-container text-white text-sm font-semibold"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
