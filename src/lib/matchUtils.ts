import type { Match } from "@/db/schema";

export function resolveCurrentMatch(allMatches: Match[]): Match | null {
  // 1. Live match has priority
  const live = allMatches.find((m) => m.status === "live") ?? null;
  if (live) return live;

  // 2. First upcoming match whose date is today or in the future
  // Drizzle returns date as "YYYY-MM-DD" string — simple string compare works
  const todayStr = new Date().toISOString().slice(0, 10); // e.g. "2026-04-23"
  const next = allMatches.find((m) => {
    if (m.status === "finished") return false;
    return String(m.date).slice(0, 10) >= todayStr;
  }) ?? null;
  if (next) return next;

  // 3. Fallback: most recent finished match
  return [...allMatches].reverse().find((m) => m.status === "finished") ?? null;
}
