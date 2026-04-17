import { redirect } from "next/navigation";
import { getParentSession } from "@/lib/parentSession";
import { db } from "@/db";
import { matches } from "@/db/schema";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MijnDashboard from "./MijnDashboard";

export default async function MijnPage() {
  const parent = await getParentSession();
  if (!parent) redirect("/inloggen");

  const allMatches = await db
    .select({ id: matches.id, opponent: matches.opponent })
    .from(matches)
    .orderBy(matches.date);

  return (
    <>
      <Header activePage="mijn" />
      <main className="mt-20 pb-28 max-w-2xl mx-auto px-4 sm:px-6">
        <MijnDashboard parent={parent} matches={allMatches} />
      </main>
      <BottomNav />
    </>
  );
}
