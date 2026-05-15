import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Simulate entering goal #2 (Tyren) and goal #3 (Syb)
  for (const scorer of ["Tyren", "Syb"]) {
    const [current] = await sql`SELECT home_score, home_scorers FROM matches WHERE id = 41`;
    const scorers: string[] = JSON.parse((current.home_scorers as string) ?? "[]");
    scorers.push(scorer);
    const newScore = (current.home_score as number) + 1;
    await sql`UPDATE matches SET home_score = ${newScore}, home_scorers = ${JSON.stringify(scorers)} WHERE id = 41`;
    console.log(`Goal by ${scorer}: home_score=${newScore}, scorers=${JSON.stringify(scorers)}`);
  }
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
