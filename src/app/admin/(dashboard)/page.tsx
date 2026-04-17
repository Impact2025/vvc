export const dynamic = "force-dynamic";

import { db } from "@/db";
import { donations, photos, comments, parents, matches } from "@/db/schema";
import { eq, desc, count, sum } from "drizzle-orm";
import Link from "next/link";

async function getDashboardData() {
  const [donationStats] = await db
    .select({ total: count(), raised: sum(donations.amount) })
    .from(donations);

  const [donationPaid] = await db
    .select({ raised: sum(donations.amount) })
    .from(donations)
    .where(eq(donations.status, "betaald"));

  const [{ pendingPhotos }] = await db
    .select({ pendingPhotos: count() })
    .from(photos)
    .where(eq(photos.approved, false));

  const [{ pendingComments }] = await db
    .select({ pendingComments: count() })
    .from(comments)
    .where(eq(comments.approved, false));

  const [{ pendingParents }] = await db
    .select({ pendingParents: count() })
    .from(parents)
    .where(eq(parents.goedgekeurd, false));

  const recentMatches = await db
    .select()
    .from(matches)
    .orderBy(desc(matches.date))
    .limit(5);

  return {
    donationCount: Number(donationStats?.total ?? 0),
    donationRaised: Number(donationPaid?.raised ?? 0),
    pendingPhotos: Number(pendingPhotos),
    pendingComments: Number(pendingComments),
    pendingParents: Number(pendingParents),
    recentMatches,
  };
}

function formatEuros(cents: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    upcoming: "bg-blue-50 text-blue-700",
    live: "bg-green-50 text-green-700",
    finished: "bg-surface-container text-on-surface-variant",
  };
  const labels: Record<string, string> = {
    upcoming: "Gepland",
    live: "Live",
    finished: "Gespeeld",
  };
  const s = status ?? "upcoming";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${styles[s] ?? styles.upcoming}`}>
      {labels[s] ?? s}
    </span>
  );
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const statCards = [
    {
      label: "Donaties",
      value: data.donationCount.toString(),
      sub: `${formatEuros(data.donationRaised)} opgehaald`,
      href: "/admin/donaties",
      color: "text-primary-container",
    },
    {
      label: "Foto's wachtrij",
      value: data.pendingPhotos.toString(),
      sub: "wachtend op goedkeuring",
      href: "/admin/fotos",
      color: data.pendingPhotos > 0 ? "text-amber-600" : "text-on-surface-variant",
    },
    {
      label: "Reacties wachtrij",
      value: data.pendingComments.toString(),
      sub: "wachtend op goedkeuring",
      href: "/admin/reacties",
      color: data.pendingComments > 0 ? "text-amber-600" : "text-on-surface-variant",
    },
    {
      label: "Ouders te goedkeuren",
      value: data.pendingParents.toString(),
      sub: "nieuwe aanmeldingen",
      href: "/admin/ouders",
      color: data.pendingParents > 0 ? "text-red-600" : "text-on-surface-variant",
    },
  ];

  const quickLinks = [
    { href: "/admin/wedstrijden", label: "Wedstrijden beheren" },
    { href: "/admin/spelers", label: "Spelerslijst" },
    { href: "/admin/instellingen", label: "Instellingen" },
    { href: "/admin/fotos", label: "Foto's uploaden" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-headline text-secondary">Beheer Paneel</h1>
        <p className="text-on-surface-variant mt-1">Welkom terug — hier is een overzicht van alles wat speelt.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">{card.label}</p>
            <p className={`text-4xl font-black font-headline ${card.color} mb-1`}>{card.value}</p>
            <p className="text-sm text-on-surface-variant">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent matches */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Recente wedstrijden</p>
            <Link
              href="/admin/wedstrijden"
              className="text-xs font-semibold text-primary-container hover:underline"
            >
              Alle wedstrijden →
            </Link>
          </div>

          {data.recentMatches.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4 text-center">Nog geen wedstrijden gepland.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Datum</th>
                    <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Tegenstander</th>
                    <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Score</th>
                    <th className="text-left py-2 font-semibold text-on-surface-variant text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentMatches.map((match) => (
                    <tr key={match.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low">
                      <td className="py-3 pr-4 text-on-surface-variant">{formatDate(match.date)}</td>
                      <td className="py-3 pr-4 font-medium text-on-surface">{match.opponent}</td>
                      <td className="py-3 pr-4 font-mono font-bold text-secondary">
                        {match.home_score ?? 0} – {match.away_score ?? 0}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={match.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Snelle links</p>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-outline-variant/20 text-sm font-medium text-on-surface hover:border-primary-container/40 hover:text-primary-container transition-colors"
                >
                  {link.label}
                  <span className="text-outline-variant">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
