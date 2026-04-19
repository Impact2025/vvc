import { db } from "@/db";
import { donations, settings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DonatieClient from "./DonatieClient";

async function getData() {
  try {
    const paidDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.status, "betaald"))
      .orderBy(desc(donations.created_at));

    const settingsRows = await db.select().from(settings);
    const settingsMap = Object.fromEntries(
      settingsRows.map((s) => [s.key, s.value ?? "0"])
    );

    const manualRaised = parseInt(settingsMap["donatie_raised"] ?? "0", 10);
    const dbRaised = paidDonations.reduce((sum, d) => sum + (d.amount ?? 0), 0);
    const raised = manualRaised + dbRaised;
    const goal = parseInt(
      settingsMap["donatie_goal"] ??
        (process.env.NEXT_PUBLIC_DONATIE_DOEL || "150000"),
      10
    );

    return { donations: paidDonations, raised, goal };
  } catch {
    return {
      donations: [],
      raised: 0,
      goal: parseInt(process.env.NEXT_PUBLIC_DONATIE_DOEL ?? "150000", 10),
    };
  }
}

export default async function DonerenPage() {
  const { donations: paidDonations, raised, goal } = await getData();

  const tikkieUrls = {
    donatie: process.env.NEXT_PUBLIC_TIKKIE_DONATIE ?? "https://tikkie.me/pay/vvcgoesuk",
    pakket_s: process.env.NEXT_PUBLIC_TIKKIE_PAKKET_S ?? "https://tikkie.me/pay/vvcgoesuk-s",
    pakket_l: process.env.NEXT_PUBLIC_TIKKIE_PAKKET_L ?? "https://tikkie.me/pay/vvcgoesuk-l",
  };

  return (
    <>
      <Header activePage="doneren" />
      <main className="mt-20 pb-28">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-secondary min-h-[420px] sm:min-h-[520px] flex items-center">
          {/* Team photo — full bleed, focal point on faces */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/donatie-hero.jpeg"
            alt="FC VVC Onder 10 team"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Gradient overlay — left side dark for text, right fades out */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-secondary/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />

          <div className="relative px-6 sm:px-8 max-w-5xl mx-auto w-full py-16 sm:py-24">
            <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-3">
              Steun VVC
            </p>
            <h1 className="text-4xl sm:text-6xl font-black font-headline text-white leading-none mb-4">
              Help ons naar<br />
              <span className="text-primary-container">Londen.</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-md leading-relaxed mb-8">
              7 jongens. 3 dagen. Jij kunt ze helpen dit te realiseren.
            </p>
            <a
              href="#doneren"
              className="inline-flex items-center gap-2 bg-primary-container text-white font-headline font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Doneer nu
            </a>
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 max-w-5xl mx-auto pt-10">
          <DonatieClient
            raised={raised}
            goal={goal}
            tikkieUrls={tikkieUrls}
            donations={paidDonations}
          />
        </div>

      </main>
      <BottomNav />
    </>
  );
}
