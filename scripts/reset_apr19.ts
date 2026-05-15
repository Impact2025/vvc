import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Reset all April 19 matches (IDs 42, 43, 44)
  const ids = [42, 43, 44];
  for (const id of ids) {
    await sql`
      UPDATE matches 
      SET home_score = 0, away_score = 0, status = 'upcoming', home_scorers = '[]'
      WHERE id = ${id}
    `;
    console.log(`Reset match ID ${id}`);
  }

  // Verify
  const res = await sql`SELECT id, opponent, home_score, away_score, status, home_scorers FROM matches WHERE id IN (42, 43, 44) ORDER BY id`;
  for (const r of res) {
    console.log(`[${r.id}] ${r.opponent} | ${r.home_score}-${r.away_score} | ${r.status} | scorers: ${r.home_scorers}`);
  }
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
