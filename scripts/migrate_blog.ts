import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf-8").split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()) as [string, string])
);

const sql = neon(env.DATABASE_URL);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      excerpt TEXT,
      cover_image TEXT,
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ blog_posts table ready");
  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
