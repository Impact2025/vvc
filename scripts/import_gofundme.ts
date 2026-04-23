import { db } from "../src/db";
import { donations } from "../src/db/schema";

const toAdd = [
  { name: "Romina Kawahira", amount: 4200 },
  { name: "Edgar Rodriguez",  amount: 4200 },
];

async function main() {
  for (const d of toAdd) {
    const [row] = await db.insert(donations).values({
      name:   d.name,
      amount: d.amount,
      type:   "free",
      status: "betaald",
    }).returning();
    console.log(`✓ ${row.name} — €${(row.amount! / 100).toFixed(0)} (id ${row.id})`);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
