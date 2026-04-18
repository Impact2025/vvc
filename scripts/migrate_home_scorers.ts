import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_gPbG6jDq9Nor@ep-plain-cell-almf0leg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);

async function main() {
  await sql`ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_scorers text DEFAULT '[]'`;
  const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='matches' AND column_name='home_scorers'`;
  console.log(res.length > 0 ? "✓ home_scorers column exists" : "✗ column missing");
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
