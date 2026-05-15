/**
 * Zet de pincode van Ouder van Tyren terug naar 1234
 * Run: npx tsx scripts/reset_pin_tyren.ts
 */

import { neon } from "@neondatabase/serverless";

const ADMIN_SECRET = process.env.ADMIN_SECRET!;
const sql = neon(process.env.DATABASE_URL!);

function hexEncode(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await globalThis.crypto.subtle.digest(
    "SHA-256",
    enc.encode(pin + ":" + ADMIN_SECRET)
  );
  return hexEncode(hash);
}

async function main() {
  const hashed = await hashPin("1234");

  const rows = await sql`
    UPDATE parents
    SET pincode = ${hashed}, pincode_is_tijdelijk = true
    WHERE kind_naam ILIKE '%Tyren%'
    RETURNING id, naam, kind_naam
  `;

  if (rows.length === 0) {
    console.log("Geen ouder gevonden voor kind Tyren.");
  } else {
    console.log(`✓ Pincode hersteld naar 1234 voor: ${rows[0].naam} (kind: ${rows[0].kind_naam})`);
  }
}

main().catch(console.error);
