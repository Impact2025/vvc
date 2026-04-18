/**
 * Zet pincode 1234 voor alle ouders in de database.
 * Run: npx tsx scripts/set-all-pins.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_gPbG6jDq9Nor@ep-plain-cell-almf0leg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "fallback-secret";

async function sha256(data: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(data));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPin(pin: string): Promise<string> {
  return sha256(pin + ":" + ADMIN_SECRET);
}

async function main() {
  const hashed = await hashPin("1234");
  const result = await db.update(schema.parents).set({ pincode: hashed }).returning({ id: schema.parents.id, naam: schema.parents.naam });
  console.log(`✅ Pincode 1234 ingesteld voor ${result.length} ouders:`);
  result.forEach((r) => console.log(`  - ${r.naam} (id: ${r.id})`));
}

main().catch((e) => {
  console.error("❌ Mislukt:", e);
  process.exit(1);
});
