"use client";

import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Donation {
  id: number;
  name: string;
  message: string | null;
  amount: number | null;
  type: string | null;
  status: string | null;
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  app_wens: string | null;
  created_at: string | null;
}

const emptyForm = {
  name: "",
  message: "",
  amount: "",
  type: "free",
  status: "pending",
  company_name: "",
  company_email: "",
  company_phone: "",
  app_wens: "",
};

export default function DonatesPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [donationGoal, setDonationGoal] = useState("");
  const [donationRaised, setDonationRaised] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [donationsRes, settingsRes] = await Promise.all([
        fetch("/api/donations?status=all&type=all"),
        fetch("/api/settings"),
      ]);
      const donationsData = await donationsRes.json();
      const settingsData = await settingsRes.json();
      // Sort by date desc
      const sorted = [...donationsData].sort((a: Donation, b: Donation) =>
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      );
      setDonations(sorted);
      setDonationGoal(settingsData.donatie_goal ? String(Math.round(parseInt(settingsData.donatie_goal) / 100)) : "");
      setDonationRaised(settingsData.donatie_raised ? String(Math.round(parseInt(settingsData.donatie_raised) / 100)) : "");
    } catch {
      toast.error("Kan data niet laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRaised = donations
    .filter((d) => d.status === "betaald")
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const totalCount = donations.filter((d) => d.status === "betaald").length;

  const formatEuros = (cents: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: form.amount ? Math.round(parseFloat(form.amount) * 100) : null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Donatie toegevoegd");
      setForm(emptyForm);
      setShowForm(false);
      fetchData();
    } catch {
      toast.error("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePaid = async (donation: Donation) => {
    const newStatus = donation.status === "betaald" ? "pending" : "betaald";
    try {
      const res = await fetch(`/api/donations/${donation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Gemarkeerd als ${newStatus === "betaald" ? "betaald" : "openstaand"}`);
      fetchData();
    } catch {
      toast.error("Opslaan mislukt");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Donatie verwijderen?")) return;
    try {
      const res = await fetch(`/api/donations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Verwijderd");
      fetchData();
    } catch {
      toast.error("Verwijderen mislukt");
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "donatie_goal", value: String(Math.round(parseFloat(donationGoal || "0") * 100)) }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "donatie_raised", value: String(Math.round(parseFloat(donationRaised || "0") * 100)) }),
        }),
      ]);
      toast.success("Instellingen opgeslagen");
    } catch {
      toast.error("Opslaan mislukt");
    } finally {
      setSavingSettings(false);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Naam", "Bedrag (€)", "Type", "Status", "Datum", "Bericht", "Bedrijf"];
    const rows = donations.map((d) => [
      d.id,
      d.name,
      d.amount ? (d.amount / 100).toFixed(2) : "",
      d.type ?? "",
      d.status ?? "",
      formatDate(d.created_at),
      d.message?.replace(/,/g, ";") ?? "",
      d.company_name ?? "",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donaties.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const zakelijkeAanvragen = donations.filter(
    (d) => d.type === "pakket_s" || d.type === "pakket_l"
  );

  const typeLabel: Record<string, string> = {
    free: "Vrij",
    pakket_s: "Pakket S",
    pakket_l: "Pakket L",
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline text-secondary">Donaties</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Beheer donaties en het donatiedoel.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="border border-primary-container text-primary-container px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-container/5 transition-colors"
          >
            Exporteer CSV
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {showForm ? "Annuleren" : "+ Donatie toevoegen"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-outline-variant/15 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Totaal opgehaald</p>
          <p className="text-3xl font-black font-headline text-primary-container">{formatEuros(totalRaised)}</p>
        </div>
        <div className="bg-white rounded-xl border border-outline-variant/15 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Donateurs</p>
          <p className="text-3xl font-black font-headline text-secondary">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-outline-variant/15 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">In wachtrij</p>
          <p className="text-3xl font-black font-headline text-amber-600">
            {donations.filter((d) => d.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Thermometer settings */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Thermometer bijwerken</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Donatiedoel (€)</label>
            <input
              type="number"
              value={donationGoal}
              onChange={(e) => setDonationGoal(e.target.value)}
              placeholder="1500"
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Handmatig opgehaald (€)</label>
            <input
              type="number"
              value={donationRaised}
              onChange={(e) => setDonationRaised(e.target.value)}
              placeholder="0"
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="mt-4 bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {savingSettings ? "Opslaan..." : "Opslaan"}
        </button>
      </div>

      {/* Add donation form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Donatie toevoegen (handmatig)</p>
          <form onSubmit={handleAddDonation} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Naam *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bedrag (€)</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="10.00" className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white">
                <option value="free">Vrij</option>
                <option value="pakket_s">Pakket S</option>
                <option value="pakket_l">Pakket L</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white">
                <option value="pending">In behandeling</option>
                <option value="betaald">Betaald</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bericht</label>
              <input type="text" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Optioneel bericht" className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
            </div>
            {form.type !== "free" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bedrijfsnaam</label>
                  <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bedrijf e-mail</label>
                  <input type="email" value={form.company_email} onChange={(e) => setForm({ ...form, company_email: e.target.value })} className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white" />
                </div>
              </>
            )}
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="px-5 py-2.5 rounded-lg border border-outline-variant/30 text-sm font-semibold text-on-surface-variant">Annuleren</button>
              <button type="submit" disabled={saving} className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Opslaan..." : "Toevoegen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Zakelijke aanvragen */}
      {zakelijkeAanvragen.length > 0 && (
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            Zakelijke aanvragen ({zakelijkeAanvragen.length})
          </p>
          <div className="space-y-3">
            {zakelijkeAanvragen.map((d) => (
              <div key={d.id} className="flex items-start justify-between p-4 rounded-lg border border-outline-variant/15 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-on-surface text-sm">{d.company_name || d.name}</span>
                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded font-semibold">{typeLabel[d.type ?? "free"]}</span>
                  </div>
                  {d.company_email && <p className="text-xs text-on-surface-variant">{d.company_email}</p>}
                  {d.company_phone && <p className="text-xs text-on-surface-variant">{d.company_phone}</p>}
                  {d.app_wens && <p className="text-xs text-on-surface-variant mt-1 italic">"{d.app_wens}"</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePaid(d)}
                    className={`text-xs px-3 py-1.5 rounded font-semibold ${d.status === "betaald" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {d.status === "betaald" ? "Betaald" : "Markeer betaald"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All donations table */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Alle donaties ({donations.length})
        </p>
        {loading ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Laden...</p>
        ) : donations.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Nog geen donaties.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Naam</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Bedrag</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Type</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Status</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Datum</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Bericht</th>
                  <th className="text-right py-2 font-semibold text-on-surface-variant text-xs">Acties</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50">
                    <td className="py-3 pr-4 font-medium text-on-surface whitespace-nowrap">{d.name}</td>
                    <td className="py-3 pr-4 font-mono text-on-surface font-semibold">
                      {d.amount ? formatEuros(d.amount) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-on-surface-variant text-xs">{typeLabel[d.type ?? "free"]}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${d.status === "betaald" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {d.status === "betaald" ? "Betaald" : "In behandeling"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-on-surface-variant text-xs whitespace-nowrap">{formatDate(d.created_at)}</td>
                    <td className="py-3 pr-4 text-on-surface-variant text-xs max-w-[160px] truncate">{d.message ?? "—"}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePaid(d)}
                          className={`text-xs px-3 py-1.5 rounded font-semibold ${d.status === "betaald" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}
                        >
                          {d.status === "betaald" ? "Openstaand" : "Betaald"}
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded font-semibold hover:bg-red-50">
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
