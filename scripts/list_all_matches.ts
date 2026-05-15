import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const res = await sql`SELECT id, opponent, date, time, home_score, away_score, status FROM matches ORDER BY date, time`;
  for (const r of res) {
    console.log(`[${r.id}] ${r.date} ${r.time} | ${r.opponent} | ${r.home_score}-${r.away_score} | ${r.status}`);
  }
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
