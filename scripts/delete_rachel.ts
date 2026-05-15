/**
 * Verwijder Rachel (Ouder van Tyren) uit de parents tabel
 * Run: npx tsx scripts/delete_rachel.ts
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`
    SELECT id, naam, kind_naam, email
    FROM parents
    WHERE naam ILIKE '%Rachel%'
       OR kind_naam ILIKE '%Tyren%'
       OR kind_naam ILIKE '%Tyre%'
  `;

  if (rows.length === 0) {
    console.log("Geen ouder gevonden met naam Rachel of kind Tyren.");
    return;
  }

  console.log("Te verwijderen:");
  for (const p of rows) {
    console.log(`  ID ${p.id} — ${p.naam} (kind: ${p.kind_naam}, email: ${p.email})`);
  }

  for (const p of rows) {
    await sql`DELETE FROM parents WHERE id = ${p.id}`;
    console.log(`✓ Verwijderd: ${p.naam}`);
  }
}

main().catch(console.error);
