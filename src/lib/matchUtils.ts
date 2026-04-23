import type { Match } from "@/db/schema";

/**
 * Returns the start datetime of a match in UTC.
 * date is stored as "YYYY-MM-DD" (or ISO string), time as "HH:MM" in Amsterdam local time (CEST = UTC+2).
 */
export function getMatchStart(m: Pick<Match, "date" | "time">): Date {
  const dateStr = String(m.date).slice(0, 10); // "YYYY-MM-DD"
  const timeStr = m.time ?? "00:00";
  return new Date(`${dateStr}T${timeStr}:00+02:00`);
}

/**
 * Returns the live match, or the next upcoming match that is actually in the future.
 * Falls back to the last finished match only when nothing is live or upcoming.
 */
export function resolveCurrentMatch(allMatches: Match[]): Match | null {
  const live = allMatches.find((m) => m.status === "live") ?? null;
  if (live) return live;

  const now = new Date();
  const next = allMatches.find(
    (m) => m.status !== "finished" && getMatchStart(m) > now
  ) ?? null;
  if (next) return next;

  // Nothing live or upcoming — show the most recent finished match
  const finished = [...allMatches].reverse().find((m) => m.status === "finished") ?? null;
  return finished;
}
