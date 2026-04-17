import { db } from "@/db";
import { photos, matches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import PhotoGrid from "@/components/photos/PhotoGrid";
import FotoUpload from "./FotoUpload";
import { getParentSession } from "@/lib/parentSession";
import type { Photo, Match } from "@/db/schema";

interface PhotoGroup {
  match: Match | null;
  matchTitle: string;
  photos: Photo[];
}

async function getData(): Promise<PhotoGroup[]> {
  try {
    const approvedPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.approved, true))
      .orderBy(desc(photos.created_at));

    const allMatches = await db.select().from(matches);
    const matchMap = new Map(allMatches.map((m) => [m.id, m]));

    // Group by match_id (null = general)
    const groups = new Map<number | null, Photo[]>();
    for (const photo of approvedPhotos) {
      const key = photo.match_id ?? null;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(photo);
    }

    const result: PhotoGroup[] = [];
    for (const [matchId, groupPhotos] of Array.from(groups.entries())) {
      const match = matchId != null ? (matchMap.get(matchId) ?? null) : null;
      result.push({
        match,
        matchTitle: match ? `VVC vs ${match.opponent}` : "Algemene Foto's",
        photos: groupPhotos,
      });
    }

    return result;
  } catch {
    return [];
  }
}

export default async function FotosPage() {
  const [groups, parent, allMatches] = await Promise.all([
    getData(),
    getParentSession(),
    db.select({ id: matches.id, opponent: matches.opponent }).from(matches),
  ]);
  const totalPhotos = groups.reduce((sum, g) => sum + g.photos.length, 0);

  return (
    <>
      <Header activePage="fotos" />
      <main className="mt-20 px-4 sm:px-6 max-w-5xl mx-auto pb-28">
        {/* Header */}
        <div className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="section-label mb-1">Galerij</p>
            <h1 className="text-3xl font-black font-headline text-on-surface">
              Toernooi{" "}
              <span className="text-primary-container">Galerij</span>
            </h1>
            {totalPhotos > 0 && (
              <p className="text-sm text-on-surface-variant mt-1">
                {totalPhotos} foto{totalPhotos !== 1 ? "'s" : ""} van de London Tour
              </p>
            )}
          </div>
          {parent?.kan_fotos_uploaden && (
            <div className="mt-2 shrink-0">
              <FotoUpload
                parentId={parent.id}
                parentNaam={parent.naam}
                matches={allMatches}
              />
            </div>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="card p-16 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-xl bg-surface-container flex items-center justify-center mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <p className="font-headline font-bold text-on-surface text-lg">
              Nog geen foto's
            </p>
            <p className="text-sm text-on-surface-variant mt-1 max-w-xs mx-auto">
              Foto's verschijnen hier zodra ze zijn goedgekeurd door de beheerder.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((group, i) => (
              <section key={i} className="animate-fade-in">
                <div className="mb-4">
                  <p className="section-label mb-1">
                    {group.match
                      ? `Wedstrijd · ${group.match.date}`
                      : "Overig"}
                  </p>
                  <h2 className="text-xl font-black font-headline text-on-surface">
                    {group.matchTitle}
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    {group.photos.length} foto{group.photos.length !== 1 ? "'s" : ""}
                  </p>
                </div>
                <PhotoGrid photos={group.photos} matchTitle={group.matchTitle} />
              </section>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
