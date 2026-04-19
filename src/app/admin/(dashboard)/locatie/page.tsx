"use client";

import { useState, useEffect, useRef } from "react";
import { Navigation, StopCircle, MapPin } from "lucide-react";

interface ServerLocation {
  active: boolean;
  lat?: number;
  lng?: number;
  updatedAt?: string;
}

export default function LocatiePage() {
  const [isTracking, setIsTracking] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Niet actief");
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [myAccuracy, setMyAccuracy] = useState<number | null>(null);
  const [server, setServer] = useState<ServerLocation>({ active: false });
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    fetch("/api/location")
      .then((r) => r.json())
      .then((data) => {
        setServer(data);
        if (data.active) setStatusMsg("GPS actief (server)");
      })
      .catch(console.error);
  }, []);

  async function sendLocation(lat: number, lng: number) {
    try {
      await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      setServer({ active: true, lat, lng, updatedAt: new Date().toISOString() });
    } catch {
      // ignore
    }
  }

  function startTracking() {
    if (!navigator.geolocation) {
      setStatusMsg("GPS niet beschikbaar op dit apparaat");
      return;
    }

    setStatusMsg("GPS zoeken...");
    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setMyLat(latitude);
        setMyLng(longitude);
        setMyAccuracy(accuracy);
        setStatusMsg(`GPS actief (~${Math.round(accuracy)}m nauwkeurig)`);

        const now = Date.now();
        if (now - lastSentRef.current > 10000) {
          lastSentRef.current = now;
          sendLocation(latitude, longitude);
        }
      },
      (err) => {
        setStatusMsg(`GPS fout: ${err.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  async function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setStatusMsg("Gestopt");

    await fetch("/api/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });
    setServer({ active: false });
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-headline text-secondary">Live Locatie</h1>
        <p className="text-on-surface-variant mt-1">
          Deel jouw GPS met alle volgers. Zichtbaar als blauwe pulserende pin op de Londen kaart.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tracking control */}
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">
            Jouw Locatie
          </p>

          <div className="flex items-center gap-3 mb-5">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                isTracking ? "bg-green-500 animate-pulse" : "bg-outline"
              }`}
            />
            <span className="text-sm font-medium text-on-surface">{statusMsg}</span>
          </div>

          {myLat !== null && myLng !== null && (
            <div className="bg-surface-container rounded-lg p-3 mb-5 font-mono text-xs text-on-surface-variant space-y-0.5">
              <p>Lat: {myLat.toFixed(6)}</p>
              <p>Lng: {myLng.toFixed(6)}</p>
              {myAccuracy !== null && <p>Nauwkeurigheid: ~{Math.round(myAccuracy)}m</p>}
            </div>
          )}

          {!isTracking ? (
            <div className="space-y-2">
              <button
                onClick={startTracking}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a3e8f] text-white font-bold font-headline text-sm hover:bg-[#162f6b] transition-colors w-full justify-center"
              >
                <Navigation size={18} />
                Locatie delen starten
              </button>
              {server.active && (
                <button
                  onClick={stopTracking}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-bold font-headline text-sm hover:bg-red-700 transition-colors w-full justify-center"
                >
                  <StopCircle size={18} />
                  GPS uitzetten (server)
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-bold font-headline text-sm hover:bg-red-700 transition-colors w-full justify-center"
            >
              <StopCircle size={18} />
              Delen stoppen
            </button>
          )}

          <p className="text-[11px] text-outline mt-4 leading-relaxed">
            Locatie wordt elke ~10 seconden gestuurd. Houd dit scherm open op je telefoon tijdens de tour.
          </p>
        </div>

        {/* Server status */}
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">
            Zichtbaar voor Volgers
          </p>

          <div className="flex items-center gap-3 mb-4">
            <MapPin
              size={20}
              className={server.active ? "text-[#1a3e8f]" : "text-outline"}
            />
            <span
              className={`font-bold text-sm ${
                server.active ? "text-[#1a3e8f]" : "text-on-surface-variant"
              }`}
            >
              {server.active ? "Live zichtbaar op kaart" : "Locatie niet gedeeld"}
            </span>
          </div>

          {server.active && server.lat != null && server.lng != null && (
            <div className="bg-blue-50 rounded-lg p-3 text-xs font-mono text-blue-800 space-y-0.5">
              <p>Lat: {server.lat.toFixed(6)}</p>
              <p>Lng: {server.lng.toFixed(6)}</p>
              {server.updatedAt && (
                <p className="mt-1 text-blue-600">
                  Bijgewerkt:{" "}
                  {new Date(server.updatedAt).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              )}
            </div>
          )}

          {!server.active && (
            <p className="text-sm text-on-surface-variant">
              Start het delen om jouw locatie te tonen op de Londen kaart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
