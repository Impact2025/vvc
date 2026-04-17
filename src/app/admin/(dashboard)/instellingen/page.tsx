"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Checkin {
  id: number;
  location_name: string;
  lat: number;
  lng: number;
  description: string | null;
  emoji: string | null;
}

const emptyCheckin = { location_name: "", lat: "", lng: "", emoji: "", description: "" };

export default function InstellingenPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newCheckin, setNewCheckin] = useState(emptyCheckin);
  const [savingCheckin, setSavingCheckin] = useState(false);

  // Push notifications state
  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [pushUrl, setPushUrl] = useState("/");
  const [pushSending, setPushSending] = useState(false);
  const [pushStats, setPushStats] = useState<{ subscribers: number } | null>(null);
  const pushStatsRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, checkinsRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/checkins"),
      ]);
      const settingsData = await settingsRes.json();
      const checkinsData = await checkinsRes.json();
      setSettings(settingsData);
      setCheckins(checkinsData);
    } catch {
      toast.error("Kan instellingen niet laden");
    } finally {
      setLoadingSettings(false);
      setLoadingCheckins(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (pushStatsRef.current) return;
    pushStatsRef.current = true;
    fetch("/api/push/send")
      .then((r) => r.json())
      .then((d) => setPushStats({ subscribers: d.subscribers ?? 0 }))
      .catch(() => {});
  }, []);

  const saveSetting = async (key: string, value: string) => {
    setSaving(key);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast.success("Opgeslagen");
    } catch {
      toast.error("Opslaan mislukt");
    } finally {
      setSaving(null);
    }
  };

  const handleSettingBlur = (key: string, value: string) => {
    saveSetting(key, value);
  };

  const handleAddCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckin.location_name || !newCheckin.lat || !newCheckin.lng) {
      toast.error("Naam, lat en lng zijn verplicht");
      return;
    }
    setSavingCheckin(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: newCheckin.location_name,
          lat: parseFloat(newCheckin.lat),
          lng: parseFloat(newCheckin.lng),
          emoji: newCheckin.emoji || null,
          description: newCheckin.description || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Check-in toegevoegd");
      setNewCheckin(emptyCheckin);
      fetchData();
    } catch {
      toast.error("Opslaan mislukt");
    } finally {
      setSavingCheckin(false);
    }
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushMessage) {
      toast.error("Titel en bericht zijn verplicht");
      return;
    }
    setPushSending(true);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pushTitle,
          message: pushMessage,
          url: pushUrl || "/",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Verzonden naar ${data.sent} abonnees`);
      setPushTitle("");
      setPushMessage("");
      setPushUrl("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verzenden mislukt";
      toast.error(msg);
    } finally {
      setPushSending(false);
    }
  };

  const handleDeleteCheckin = async (id: number) => {
    if (!confirm("Check-in verwijderen?")) return;
    try {
      const res = await fetch(`/api/checkins/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Verwijderd");
      fetchData();
    } catch {
      toast.error("Verwijderen mislukt");
    }
  };

  const Toggle = ({ settingKey, label }: { settingKey: string; label: string }) => {
    const value = settings[settingKey] === "true";
    return (
      <div className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
        <span className="text-sm font-medium text-on-surface">{label}</span>
        <button
          onClick={() => saveSetting(settingKey, String(!value))}
          disabled={saving === settingKey}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? "bg-primary-container" : "bg-outline-variant/30"} disabled:opacity-50`}
          role="switch"
          aria-checked={value}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
    );
  };

  const TextSetting = ({
    settingKey,
    label,
    placeholder,
    type = "text",
    prefix,
  }: {
    settingKey: string;
    label: string;
    placeholder?: string;
    type?: string;
    prefix?: string;
  }) => {
    const [localValue, setLocalValue] = useState(settings[settingKey] ?? "");

    useEffect(() => {
      setLocalValue(settings[settingKey] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings[settingKey]]);

    return (
      <div className="mb-4">
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">{label}</label>
        <div className="flex gap-2">
          {prefix && (
            <span className="flex items-center px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-l-lg text-sm text-on-surface-variant border-r-0">
              {prefix}
            </span>
          )}
          <input
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => handleSettingBlur(settingKey, localValue)}
            placeholder={placeholder}
            className={`flex-1 border border-outline-variant/30 px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white ${prefix ? "rounded-r-lg" : "rounded-lg"}`}
          />
          <button
            onClick={() => saveSetting(settingKey, localValue)}
            disabled={saving === settingKey}
            className="px-4 py-2.5 bg-primary-container text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
          >
            {saving === settingKey ? "..." : "Opslaan"}
          </button>
        </div>
      </div>
    );
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-on-surface-variant">Laden...</p>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-headline text-secondary">Instellingen</h1>
        <p className="text-on-surface-variant mt-1 text-sm">Beheer app-instellingen, donatiedoelen en locatiepins.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donatie instellingen */}
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Donatie</p>
          <TextSetting settingKey="donatie_goal" label="Donatiedoel (eurocenten)" placeholder="150000" type="number" />
          <TextSetting settingKey="donatie_raised" label="Handmatig opgehaald (eurocenten)" placeholder="0" type="number" />
        </div>

        {/* Tikkie links */}
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Tikkie links</p>
          <TextSetting settingKey="tikkie_donatie" label="Tikkie — Donatie" placeholder="https://tikkie.me/..." prefix="🔗" />
          <TextSetting settingKey="tikkie_pakket_s" label="Tikkie — Pakket S" placeholder="https://tikkie.me/..." prefix="🔗" />
          <TextSetting settingKey="tikkie_pakket_l" label="Tikkie — Pakket L" placeholder="https://tikkie.me/..." prefix="🔗" />
        </div>

        {/* Welkomsttekst */}
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Welkomsttekst</p>
          <WelkomstTekstSetting settings={settings} saveSetting={saveSetting} saving={saving} />
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Functies</p>
          <Toggle settingKey="auto_approve_comments" label="Auto-keuren reacties" />
          <Toggle settingKey="tour_active" label="Tour actief" />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Push Notificaties
          </p>
          {pushStats !== null && (
            <span className="text-xs font-semibold text-primary-container bg-primary-container/10 px-2.5 py-1 rounded-full">
              {pushStats.subscribers} abonnee{pushStats.subscribers !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <form onSubmit={handleSendPush} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Titel</label>
            <input
              type="text"
              value={pushTitle}
              onChange={(e) => setPushTitle(e.target.value)}
              placeholder="DOELPUNT! ⚽"
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bericht</label>
            <textarea
              value={pushMessage}
              onChange={(e) => setPushMessage(e.target.value)}
              placeholder="VVC 2–0 City! Wat een goal van Sam!"
              rows={2}
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Link (optioneel)</label>
            <select
              value={pushUrl}
              onChange={(e) => setPushUrl(e.target.value)}
              className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
            >
              <option value="/">Homepage</option>
              <option value="/live">Live wedstrijd</option>
              <option value="/fotos">Foto&apos;s</option>
              <option value="/kids">Kids corner</option>
              <option value="/londen">Londen kaart</option>
              <option value="/doneren">Doneren</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pushSending}
            className="w-full bg-primary-container text-white py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {pushSending ? "Verzenden..." : "Verstuur naar iedereen"}
          </button>
        </form>
      </div>

      {/* Check-ins / Londen pins */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Londen Check-ins ({checkins.length})
        </p>

        {/* Add checkin form */}
        <form onSubmit={handleAddCheckin} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 p-4 bg-surface-container-low rounded-lg">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Naam *</label>
            <input
              type="text"
              value={newCheckin.location_name}
              onChange={(e) => setNewCheckin({ ...newCheckin, location_name: e.target.value })}
              placeholder="Wembley Stadium"
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Lat *</label>
            <input
              type="number"
              step="any"
              value={newCheckin.lat}
              onChange={(e) => setNewCheckin({ ...newCheckin, lat: e.target.value })}
              placeholder="51.5560"
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Lng *</label>
            <input
              type="number"
              step="any"
              value={newCheckin.lng}
              onChange={(e) => setNewCheckin({ ...newCheckin, lng: e.target.value })}
              placeholder="-0.2795"
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Emoji</label>
            <input
              type="text"
              value={newCheckin.emoji}
              onChange={(e) => setNewCheckin({ ...newCheckin, emoji: e.target.value })}
              placeholder="⚽"
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingCheckin}
              className="w-full bg-primary-container text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {savingCheckin ? "..." : "+ Toevoegen"}
            </button>
          </div>
          <div className="col-span-2 sm:col-span-3 lg:col-span-6">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Beschrijving</label>
            <input
              type="text"
              value={newCheckin.description}
              onChange={(e) => setNewCheckin({ ...newCheckin, description: e.target.value })}
              placeholder="Optionele beschrijving"
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-0 bg-white"
            />
          </div>
        </form>

        {/* Checkins list */}
        {loadingCheckins ? (
          <p className="text-sm text-on-surface-variant text-center py-4">Laden...</p>
        ) : checkins.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-4">Nog geen pins toegevoegd.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Pin</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Naam</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Coördinaten</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Beschrijving</th>
                  <th className="text-right py-2 font-semibold text-on-surface-variant text-xs">Actie</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant/5 last:border-0">
                    <td className="py-2 pr-4 text-xl">{c.emoji ?? "📍"}</td>
                    <td className="py-2 pr-4 font-medium text-on-surface">{c.location_name}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-on-surface-variant">
                      {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                    </td>
                    <td className="py-2 pr-4 text-on-surface-variant text-xs max-w-xs truncate">{c.description ?? "—"}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleDeleteCheckin(c.id)}
                        className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded font-semibold hover:bg-red-50"
                      >
                        Verwijder
                      </button>
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

// Separate component to manage its own local state for the welkomsttekst textarea
function WelkomstTekstSetting({
  settings,
  saveSetting,
  saving,
}: {
  settings: Record<string, string>;
  saveSetting: (key: string, value: string) => Promise<void>;
  saving: string | null;
}) {
  const [value, setValue] = useState(settings.welkom_bericht ?? "");

  useEffect(() => {
    setValue(settings.welkom_bericht ?? "");
  }, [settings.welkom_bericht]);

  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-1">Welkomsttekst</label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Welkomsttekst voor de homepage..."
        className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white resize-none mb-2"
      />
      <button
        onClick={() => saveSetting("welkom_bericht", value)}
        disabled={saving === "welkom_bericht"}
        className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {saving === "welkom_bericht" ? "Opslaan..." : "Opslaan"}
      </button>
    </div>
  );
}
