import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`UPDATE matches SET home_score = 1, home_scorers = '["Thomas"]' WHERE id = 41`;
  const [r] = await sql`SELECT home_score, away_score, status, home_scorers FROM matches WHERE id = 41`;
  console.log(r);
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
