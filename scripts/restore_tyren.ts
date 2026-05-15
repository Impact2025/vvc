/**
 * Zet Ouder van Tyren terug in de parents tabel
 * Run: npx tsx scripts/restore_tyren.ts
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    INSERT INTO parents (naam, email, kind_naam, rol, toestemming_fotos, toestemming_app, kan_fotos_uploaden, kan_commentaar, goedgekeurd)
    VALUES ('Ouder van Tyren', 'tyren.ouder@example.nl', 'Tyren', 'ouder', true, true, false, true, true)
  `;
  console.log("✓ Ouder van Tyren hersteld");
}

main().catch(console.error);
