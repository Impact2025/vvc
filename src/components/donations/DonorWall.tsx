import { Heart } from "lucide-react";
import { formatEuro, getInitials, timeAgo } from "@/lib/utils";
import type { Donation } from "@/db/schema";

interface DonorWallProps {
  donations: Donation[];
}

const TIER_BADGES: Record<string, { label: string; className: string }> = {
  supporter:    { label: "Supporter",    className: "bg-blue-50 text-blue-600 border-blue-200" },
  vriend:       { label: "Vriend",       className: "bg-orange-50 text-orange-600 border-orange-200" },
  sponsor:      { label: "Sponsor",      className: "bg-amber-50 text-amber-700 border-amber-200" },
  hoofdsponsor: { label: "Hoofdsponsor", className: "bg-purple-50 text-purple-700 border-purple-200" },
};

function TierBadge({ tier }: { tier: string | null | undefined }) {
  if (!tier) return null;
  const badge = TIER_BADGES[tier];
  if (!badge) return null;
  return (
    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${badge.className}`}>
      {badge.label}
    </span>
  );
}

const AVATAR_PALETTES = [
  { bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-200" },
  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
  { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200" },
  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200" },
  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
];

function palette(name: string) {
  return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];
}

function FeaturedDonor({ d }: { d: Donation }) {
  const p = palette(d.name);
  return (
    <div className="card card-hover p-6 border-l-4 border-l-primary-container bg-gradient-to-br from-primary-fixed/30 to-white">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl ${p.bg} border ${p.border} flex items-center justify-center text-xl font-black font-headline ${p.text} flex-shrink-0`}>
          {getInitials(d.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-headline font-black text-on-surface text-base leading-tight">{d.name}</p>
            <TierBadge tier={d.tier} />
          </div>
          {d.amount && (
            <p className="text-3xl font-black font-headline text-primary-container tabular-nums mt-0.5">
              {formatEuro(d.amount)}
            </p>
          )}
        </div>
        <Heart size={16} className="text-primary-container flex-shrink-0 mt-1 fill-primary-container/20" />
      </div>
      {d.message && (
        <p className="text-sm text-on-surface-variant leading-relaxed italic border-l-2 border-outline-variant/30 pl-3">
          &ldquo;{d.message}&rdquo;
        </p>
      )}
      {d.created_at && (
        <p className="text-[11px] text-outline mt-3">{timeAgo(d.created_at)}</p>
      )}
    </div>
  );
}

function RegularDonor({ d }: { d: Donation }) {
  const p = palette(d.name);
  return (
    <div className="card card-hover p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${p.bg} border ${p.border} flex items-center justify-center text-sm font-black font-headline ${p.text} flex-shrink-0`}>
        {getInitials(d.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="font-headline font-bold text-on-surface text-sm truncate">{d.name}</p>
            <TierBadge tier={d.tier} />
          </div>
          {d.amount && (
            <p className="font-black font-headline text-primary-container text-sm tabular-nums flex-shrink-0">
              {formatEuro(d.amount)}
            </p>
          )}
        </div>
        {d.message && (
          <p className="text-xs text-on-surface-variant truncate mt-0.5">&ldquo;{d.message}&rdquo;</p>
        )}
      </div>
    </div>
  );
}

export default function DonorWall({ donations }: DonorWallProps) {
  const featured = donations.filter((d) => d.tier === "hoofdsponsor" || (d.amount ?? 0) >= 10000);
  const regular  = donations.filter((d) => d.tier !== "hoofdsponsor" && (d.amount ?? 0) < 10000);
  const total    = donations.reduce((s, d) => s + (d.amount ?? 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart size={18} className="text-primary-container fill-primary-container/20" />
          <p className="section-label">Doneursmuur</p>
        </div>
        {donations.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-outline">{donations.length} donateur{donations.length !== 1 ? "s" : ""}</p>
            <p className="text-sm font-black font-headline text-primary-container">{formatEuro(total)} totaal</p>
          </div>
        )}
      </div>

      {donations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-fixed flex items-center justify-center mb-4">
            <Heart size={24} className="text-primary-container" />
          </div>
          <p className="font-headline font-black text-on-surface text-lg">Wees de eerste!</p>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs mx-auto">
            Doneer en jouw naam staat als eerste op de muur.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Featured donors */}
          {featured.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              {featured.map((d) => <FeaturedDonor key={d.id} d={d} />)}
            </div>
          )}

          {/* Regular donors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {regular.map((d) => <RegularDonor key={d.id} d={d} />)}

            {/* CTA tile */}
            <a
              href="#doneren"
              className="card card-hover p-4 flex items-center gap-3 border-dashed cursor-pointer group hover:border-primary-container/30"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0 group-hover:bg-primary-container/20 transition-colors">
                <Heart size={16} className="text-primary-container" />
              </div>
              <div>
                <p className="text-sm font-bold font-headline text-primary-container">+ Jouw naam hier</p>
                <p className="text-xs text-on-surface-variant">Doneer en kom op de muur</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
