import { db } from "../src/db";
import { photos } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const all = await db.select().from(photos).where(eq(photos.approved, true));
  console.log(`Totaal goedgekeurde foto's: ${all.length}`);

  const domains = new Map<string, number>();
  const badUrls: { id: number; url: string }[] = [];

  for (const p of all) {
    if (!p.url) { badUrls.push({ id: p.id, url: "(leeg)" }); continue; }
    try {
      const u = new URL(p.url);
      domains.set(u.hostname, (domains.get(u.hostname) ?? 0) + 1);
    } catch {
      badUrls.push({ id: p.id, url: p.url });
    }
  }

  console.log("\nDomeinen:");
  for (const [host, count] of domains) console.log(`  ${host}: ${count}x`);

  if (badUrls.length) {
    console.log("\nProblematische URL's:");
    for (const b of badUrls) console.log(`  id ${b.id}: ${b.url}`);
  } else {
    console.log("\nGeen problematische URL's gevonden.");
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
