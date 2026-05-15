import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Simulate what the PATCH handler does
  const matchId = 41; // SJC match
  const scorer_name = "Thomas";
  const new_home_score = 12;

  // Fetch current
  const [current] = await sql`SELECT id, home_score, home_scorers FROM matches WHERE id = ${matchId}`;
  console.log("Current:", current);

  // Build new scorers array
  const scorers: string[] = JSON.parse((current.home_scorers as string) ?? "[]");
  scorers.push(scorer_name);
  const newScorers = JSON.stringify(scorers);
  console.log("New scorers:", newScorers);

  // Update
  await sql`UPDATE matches SET home_score = ${new_home_score}, home_scorers = ${newScorers} WHERE id = ${matchId}`;

  // Verify
  const [updated] = await sql`SELECT home_score, home_scorers FROM matches WHERE id = ${matchId}`;
  console.log("Updated:", updated);
  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
