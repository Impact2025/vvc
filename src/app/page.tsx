import { db } from "@/db";
import {
  matches,
  photos,
  donations,
  settings,
  comments,
  checkins,
} from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import LiveScore from "@/components/home/LiveScore";
import DonationThermometer from "@/components/home/DonationThermometer";
import QuickLinks from "@/components/home/QuickLinks";
import ActivityFeed, { type Activity } from "@/components/home/ActivityFeed";
import Countdown from "@/components/home/Countdown";
import ChatBot from "@/components/home/ChatBot";
import LiveLocationBanner from "@/components/home/LiveLocationBanner";
import type { Match } from "@/db/schema";

async function getData() {
  try {
    // Fetch live or next upcoming match
    const allMatches = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.date));

    const liveMatch = allMatches.find((m) => m.status === "live") ?? null;
    const upcomingMatches = allMatches
      .filter((m) => m.status === "upcoming")
      .reverse();
    const nextMatch = upcomingMatches[0] ?? null;
    const currentMatch: Match | null = liveMatch ?? nextMatch;

    // Donation settings
    const settingsRows = await db.select().from(settings);
    const settingsMap = Object.fromEntries(
      settingsRows.map((s) => [s.key, s.value ?? "0"])
    );
    const raised = parseInt(settingsMap["donatie_raised"] ?? "0", 10);
    const goal = parseInt(
      settingsMap["donatie_goal"] ??
        (process.env.NEXT_PUBLIC_DONATIE_DOEL || "150000"),
      10
    );

    // Recent approved photos
    const recentPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.approved, true))
      .orderBy(desc(photos.created_at))
      .limit(3);

    // Recent approved comments
    const recentComments = await db
      .select()
      .from(comments)
      .where(eq(comments.approved, true))
      .orderBy(desc(comments.created_at))
      .limit(2);

    // Recent betaald donations
    const recentDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.status, "betaald"))
      .orderBy(desc(donations.created_at))
      .limit(2);

    // Recent checkins
    const recentCheckins = await db
      .select()
      .from(checkins)
      .orderBy(desc(checkins.created_at))
      .limit(2);

    // Compose activity feed
    const activities: Activity[] = [
      ...recentPhotos.map((p) => ({
        id: `photo-${p.id}`,
        type: "photo" as const,
        title: p.uploader_name
          ? `${p.uploader_name} plaatste een foto`
          : "Nieuwe foto toegevoegd",
        description: p.caption ?? undefined,
        timestamp: p.created_at ?? new Date(),
      })),
      ...recentComments.map((c) => ({
        id: `comment-${c.id}`,
        type: "comment" as const,
        title: `${c.author_name} reageerde`,
        description: c.message.slice(0, 80) + (c.message.length > 80 ? "…" : ""),
        timestamp: c.created_at ?? new Date(),
      })),
      ...recentDonations.map((d) => ({
        id: `donation-${d.id}`,
        type: "donation" as const,
        title: `${d.name} doneerde`,
        description: d.message ?? undefined,
        timestamp: d.created_at ?? new Date(),
      })),
      ...recentCheckins.map((ci) => ({
        id: `checkin-${ci.id}`,
        type: "checkin" as const,
        title: `Check-in: ${ci.location_name}`,
        description: ci.description ?? undefined,
        timestamp: ci.created_at ?? new Date(),
      })),
    ]
      .sort((a, b) => {
        const ta = new Date(a.timestamp).getTime();
        const tb = new Date(b.timestamp).getTime();
        return tb - ta;
      })
      .slice(0, 5);

    return { currentMatch, raised, goal, activities };
  } catch (err) {
    console.error("Home page data fetch error:", err);
    return {
      currentMatch: null,
      raised: 0,
      goal: parseInt(process.env.NEXT_PUBLIC_DONATIE_DOEL ?? "150000", 10),
      activities: [],
    };
  }
}

export default async function HomePage() {
  const { currentMatch, raised, goal, activities } = await getData();
  const tikkieUrl =
    process.env.NEXT_PUBLIC_TIKKIE_DONATIE ?? "https://tikkie.me/pay/vvcgoesuk";

  return (
    <>
      <Header activePage="home" />
      <main className="mt-20 px-4 sm:px-6 max-w-5xl mx-auto pb-28">
        {/* Hero */}
        <div className="relative mt-6 mb-8 rounded-3xl overflow-hidden h-64 sm:h-80">
          <img
            src="/hero.jpg"
            alt="VVC Little Lions"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">
              VVC Goes UK
            </p>
            <h1 className="text-3xl sm:text-4xl font-black font-headline text-white leading-tight">
              London Tour <span className="text-orange-400">2026</span>
            </h1>
            <p className="text-white/70 mt-1 text-sm leading-relaxed">
              Volg de Little Lions live vanuit Londen.
            </p>
          </div>
        </div>

        {/* Live locatie banner (alleen zichtbaar als GPS actief) */}
        <LiveLocationBanner />

        {/* Live / Next Match */}
        <LiveScore match={currentMatch} />

        {/* Bento: Donation + Countdown + Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="md:col-span-2">
            <DonationThermometer raised={raised} goal={goal} tikkieUrl={tikkieUrl} />
          </div>
          <div className="h-full">
            <Countdown />
          </div>
        </div>

        {/* Quick links */}
        <div className="mb-10">
          <QuickLinks />
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} />
      </main>
      <BottomNav />
      <ChatBot />
    </>
  );
}
