/**
 * Import echte GoFundMe donaties in de donations tabel
 * Run: npx tsx scripts/import-gofundme.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_gPbG6jDq9Nor@ep-plain-cell-almf0leg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

const gofundmeDonations = [
  { name: "Anoniem", amount: 8400 },
  { name: "Mike Unwin", amount: 4200 },
  { name: "Kelsi Gittins", amount: 5700 },
  { name: "Anoniem", amount: 5000 },
  { name: "Hasan Velagic", amount: 4200 },
  { name: "Nicki Castellano", amount: 4200 },
  { name: "Arman Ikanovic", amount: 4200 },
  { name: "Amilcar Soriano", amount: 4200 },
  { name: "Fanny L Ramirez", amount: 3400 },
  { name: "Anoniem", amount: 5000 },
  { name: "Peter en Hanneke Bakker", amount: 2000 },
];

async function importDonations() {
  console.log("💶 GoFundMe donaties importeren...\n");

  const total = gofundmeDonations.reduce((sum, d) => sum + d.amount, 0);
  console.log(`Totaal: €${total / 100} (${gofundmeDonations.length} donateurs)\n`);

  for (const d of gofundmeDonations) {
    await db.insert(schema.donations).values({
      name: d.name,
      amount: d.amount,
      type: "free",
      status: "betaald",
      message: "Via GoFundMe",
    });
    console.log(`✅ ${d.name} — €${d.amount / 100}`);
  }

  console.log("\n✔️  Import klaar!");
}

importDonations().catch(console.error);
