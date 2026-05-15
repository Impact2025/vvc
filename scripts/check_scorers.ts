import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const res = await sql`SELECT id, opponent, home_score, away_score, status, home_scorers FROM matches ORDER BY id DESC LIMIT 5`;
  for (const r of res) {
    console.log(`[${r.id}] ${r.opponent} | ${r.home_score}-${r.away_score} | ${r.status} | scorers: ${r.home_scorers}`);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
