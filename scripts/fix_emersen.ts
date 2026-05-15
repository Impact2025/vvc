/**
 * Fix spelling Emerson → Emersen in de database
 * Run: npx tsx scripts/fix_emersen.ts
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const result = await sql`
    UPDATE parents
    SET naam = 'Ouder van Emersen', kind_naam = 'Emersen'
    WHERE naam ILIKE '%Emerson%' OR kind_naam ILIKE '%Emerson%'
    RETURNING id, naam, kind_naam
  `;
  if (result.length === 0) {
    console.log("Niets gevonden met 'Emerson'.");
  } else {
    for (const p of result) console.log(`✓ Bijgewerkt: ${p.naam} (kind: ${p.kind_naam})`);
  }
}

main().catch(console.error);
