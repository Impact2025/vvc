/**
 * Hernoem Ouder van Thomas → Ouder van Deniz in de database
 * Run: npx tsx scripts/rename_thomas_to_deniz.ts
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const result = await sql`
    UPDATE parents
    SET naam = 'Ouder van Deniz', kind_naam = 'Deniz'
    WHERE naam ILIKE '%Thomas%' OR kind_naam ILIKE '%Thomas%'
    RETURNING id, naam, kind_naam, email
  `;

  if (result.length === 0) {
    console.log("Geen ouder gevonden met naam/kind Thomas.");
    return;
  }

  for (const p of result) {
    console.log(`✓ Bijgewerkt: ${p.naam} (kind: ${p.kind_naam}, email: ${p.email})`);
  }
}

main().catch(console.error);
