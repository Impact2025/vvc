import { db } from "../src/db";
import { photos } from "../src/db/schema";
import { eq, inArray } from "drizzle-orm";

const APP_URL = "https://vvcgoesuk.nl";

// Relatieve paden omzetten naar absolute URL + duplicaat verwijderen
const updates: { id: number; url: string }[] = [
  { id: 25, url: `${APP_URL}/photos/dropjes-stand.jpeg` },
  { id: 26, url: `${APP_URL}/photos/duimpjes-omhoog.jpeg` },
  { id: 27, url: `${APP_URL}/photos/dropjes-tafel.jpeg` },
  { id: 28, url: `${APP_URL}/photos/dropjes-verkoop.jpeg` },
  { id: 29, url: `${APP_URL}/photos/team-pose.jpeg` },
  { id: 30, url: `${APP_URL}/photos/dropjes-actie.jpeg` },
];

async function main() {
  // Update relatieve paden naar absolute URLs
  for (const u of updates) {
    await db.update(photos).set({ url: u.url }).where(eq(photos.id, u.id));
    console.log(`✓ id ${u.id} → ${u.url}`);
  }

  // Verwijder duplicaat (id 31 = zelfde als id 25 na update)
  await db.delete(photos).where(eq(photos.id, 31));
  console.log("✓ Duplicaat id 31 verwijderd");

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
