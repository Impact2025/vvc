"use client";

import { useEffect, useRef, useState } from "react";

interface Checkin {
  id: number;
  location_name: string;
  lat: number;
  lng: number;
  description: string | null;
  emoji: string | null;
}

interface LiveLocation {
  active: boolean;
  lat?: number;
  lng?: number;
  updatedAt?: string;
}

interface LeafletMapProps {
  checkins: Checkin[];
}

export default function LeafletMap({ checkins }: LeafletMapProps) {
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const liveMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [liveLocation, setLiveLocation] = useState<LiveLocation>({ active: false });

  // Initialize map and checkin markers
  useEffect(() => {
    import("leaflet").then((L) => {
      leafletRef.current = L;

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      const container = document.getElementById("leaflet-map");
      if (!container) return;
      if ((container as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

      const map = L.map("leaflet-map").setView([51.5074, -0.1278], 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;background:#f47920;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      checkins.forEach((checkin) => {
        const popup = `
          <div style="font-family:Manrope,sans-serif;min-width:140px">
            <p style="font-size:20px;margin:0 0 4px">${checkin.emoji ?? "📍"}</p>
            <p style="font-weight:800;font-size:14px;color:#1c1b1b;margin:0 0 4px">${checkin.location_name}</p>
            ${checkin.description ? `<p style="font-size:12px;color:#574237;margin:0">${checkin.description}</p>` : ""}
          </div>
        `;
        L.marker([checkin.lat, checkin.lng], { icon }).addTo(map).bindPopup(popup);
      });

      setMapReady(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      liveMarkerRef.current = null;
      setMapReady(false);
    };
  }, [checkins]);

  // Update live marker whenever location or mapReady changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;

    if (liveMarkerRef.current) {
      liveMarkerRef.current.remove();
      liveMarkerRef.current = null;
    }

    if (!liveLocation.active || liveLocation.lat == null || liveLocation.lng == null) return;

    const liveIcon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;width:44px;height:44px;background:#1a3e8f;border-radius:50%;animation:gps-pulse 2s ease-out infinite"></div>
          <div style="position:absolute;width:26px;height:26px;background:#1a3e8f;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(26,62,143,0.4)"></div>
          <div style="position:absolute;width:10px;height:10px;background:white;border-radius:50%"></div>
        </div>
        <style>@keyframes gps-pulse{0%{transform:scale(0.6);opacity:0.4}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.5);opacity:0}}</style>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -26],
    });

    const time = liveLocation.updatedAt
      ? new Date(liveLocation.updatedAt).toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const popup = `
      <div style="font-family:Manrope,sans-serif;min-width:140px">
        <p style="font-weight:800;font-size:14px;color:#1a3e8f;margin:0 0 3px">VVC is hier!</p>
        ${time ? `<p style="font-size:11px;color:#574237;margin:0">Bijgewerkt om ${time}</p>` : ""}
      </div>
    `;

    liveMarkerRef.current = L.marker([liveLocation.lat, liveLocation.lng], { icon: liveIcon })
      .addTo(map)
      .bindPopup(popup);
  }, [liveLocation, mapReady]);

  // Poll live location every 15s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/location");
        const data: LiveLocation = await res.json();
        setLiveLocation(data);
      } catch {
        // ignore network errors
      }
    };

    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {liveLocation.active && (
        <div className="mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1a3e8f]/10 border border-[#1a3e8f]/20 text-[#1a3e8f] text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#1a3e8f] animate-pulse flex-shrink-0" />
          VVC is nu live zichtbaar op de kaart — klik op de blauwe pin
        </div>
      )}
      <div
        id="leaflet-map"
        className="w-full rounded-xl overflow-hidden border border-outline-variant/15"
        style={{ height: "420px" }}
      />
    </>
  );
}
