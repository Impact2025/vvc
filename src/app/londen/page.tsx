import { db } from "@/db";
import { checkins } from "@/db/schema";
import { asc } from "drizzle-orm";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import type { Checkin } from "@/db/schema";

// Dynamically import the map to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

async function getData(): Promise<Checkin[]> {
  try {
    return await db.select().from(checkins).orderBy(asc(checkins.created_at));
  } catch {
    return [];
  }
}

export default async function LondenPage() {
  const allCheckins = await getData();

  return (
    <>
      <Header activePage="londen" />
      <main className="mt-20 px-4 sm:px-6 max-w-5xl mx-auto pb-28">
        {/* Header */}
        <div className="pt-8 pb-6">
          <p className="section-label mb-1">Locaties</p>
          <h1 className="text-3xl font-black font-headline text-on-surface">
            Londen <span className="text-primary-container">Gids</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Plekken die we bezoeken tijdens de tour
          </p>
        </div>

        {/* Map */}
        <div className="mb-8">
          {allCheckins.length === 0 ? (
            <div
              className="rounded-xl bg-surface-container border border-outline-variant/15 flex items-center justify-center"
              style={{ height: "420px" }}
            >
              <div className="text-center p-8">
                <span className="text-4xl block mb-3">🗺️</span>
                <p className="font-headline font-bold text-on-surface">Kaart wordt geladen</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  Locaties worden toegevoegd tijdens de tour
                </p>
              </div>
            </div>
          ) : (
            <LeafletMap checkins={allCheckins} />
          )}
        </div>

        {/* Checkin list */}
        {allCheckins.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-on-surface-variant text-sm">
              Locaties worden toegevoegd tijdens de tour. Kom terug!
            </p>
          </div>
        ) : (
          <div>
            <p className="section-label mb-4">Bezochte Locaties</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allCheckins.map((checkin) => (
                <div key={checkin.id} className="card card-hover p-5 flex gap-4 animate-fade-in">
                  {checkin.emoji && (
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0 text-2xl">
                      {checkin.emoji}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-headline font-bold text-on-surface">
                      {checkin.location_name}
                    </p>
                    {checkin.description && (
                      <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                        {checkin.description}
                      </p>
                    )}
                    <p className="text-[11px] text-outline mt-2 font-medium">
                      {checkin.lat.toFixed(4)}, {checkin.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
