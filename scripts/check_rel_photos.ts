import { db } from "../src/db";
import { photos } from "../src/db/schema";

async function main() {
  const rows = await db.select({ id: photos.id, url: photos.url, approved: photos.approved }).from(photos);
  const rel = rows.filter(r => r.url && !r.url.startsWith("http"));
  console.log("Relatieve paden:");
  console.log(JSON.stringify(rel, null, 2));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
