"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink, Check,
  Share2, CheckCircle, ChevronRight, X,
} from "lucide-react";
import DonorWall from "@/components/donations/DonorWall";
import DonationThermometer from "@/components/donations/DonationThermometer";
import toast from "react-hot-toast";
import type { Donation } from "@/db/schema";

interface DonatieClientProps {
  raised: number;
  goal: number;
  tikkieUrls: { donatie: string; pakket_s: string; pakket_l: string; tourpartner: string; hoofdtourpartner: string };
  donations: Donation[];
}

type TierId = "supporter" | "vriend" | "sponsor" | "hoofdsponsor";

interface Tier {
  id: TierId;
  label: string;
  amount: number;
  emoji: string;
  popular?: boolean;
  requireEmail: boolean;
  perks: string[];
}

const TIERS: Tier[] = [
  {
    id: "supporter",
    label: "Supporter",
    amount: 10,
    emoji: "⚽",
    requireEmail: false,
    perks: ["Naam op de doneursmuur"],
  },
  {
    id: "vriend",
    label: "Vriend",
    amount: 25,
    emoji: "🧡",
    popular: true,
    requireEmail: true,
    perks: ["Naam op de doneursmuur", "Weekendverslag per mail"],
  },
  {
    id: "sponsor",
    label: "Sponsor",
    amount: 50,
    emoji: "🏆",
    requireEmail: true,
    perks: ["Naam op de doneursmuur", "Weekendverslag per mail", "Fotopakket na afloop"],
  },
  {
    id: "hoofdsponsor",
    label: "Hoofdsponsor",
    amount: 100,
    emoji: "⭐",
    requireEmail: true,
    perks: ["Naam op de doneursmuur", "Weekendverslag per mail", "Fotopakket na afloop", "Bedankkaartje van de kids"],
  },
];

function DonationForm({ tikkieUrl }: { tikkieUrl: string }) {
  const [tier, setTier] = useState<TierId>("vriend");
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [bericht, setBericht] = useState("");
  const [bedrag, setBedrag] = useState<number>(25);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedTier = TIERS.find((t) => t.id === tier)!;

  function handleTierSelect(t: Tier) {
    setTier(t.id);
    setBedrag(t.amount);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) { toast.error("Vul je naam in."); return; }
    if (selectedTier.requireEmail && !email.trim()) { toast.error("Vul je e-mailadres in."); return; }
    if (bedrag < selectedTier.amount) { toast.error(`Minimaal €${selectedTier.amount} voor ${selectedTier.label}.`); return; }

    setLoading(true);
    try {
      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: naam.trim(),
          message: bericht.trim() || null,
          amount: Math.round(bedrag * 100),
          type: "free",
          tier,
          email: email.trim() || null,
        }),
      });
      setSuccess(true);
      window.open(tikkieUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <div>
          <p className="font-headline font-black text-xl text-on-surface">Bedankt, {naam.split(" ")[0]}!</p>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs">
            Betaal via Tikkie. Daarna verschijnt je naam op de doneursmuur
            {selectedTier.requireEmail && email ? " en sturen we je het weekendverslag" : ""}.
          </p>
        </div>
        <button
          onClick={() => window.open(tikkieUrl, "_blank", "noopener,noreferrer")}
          className="btn-primary flex items-center gap-2"
        >
          Open Tikkie opnieuw <ExternalLink size={14} />
        </button>
        <button onClick={() => setSuccess(false)} className="text-xs text-outline underline">
          Nog een donatie doen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tier selection */}
      <div>
        <label className="section-label block mb-3">Kies je niveau</label>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTierSelect(t)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                tier === t.id
                  ? "border-primary-container bg-primary-fixed"
                  : "border-outline-variant/20 bg-white hover:border-outline-variant/40"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-2 left-3 text-[9px] font-black uppercase tracking-widest bg-primary-container text-white px-2 py-0.5 rounded-full">
                  Populair
                </span>
              )}
              <span className="text-xl mb-1.5 block">{t.emoji}</span>
              <p className={`font-headline font-black text-sm ${tier === t.id ? "text-primary-container" : "text-on-surface"}`}>
                {t.label}
              </p>
              <p className={`text-lg font-black font-headline leading-none mb-2 ${tier === t.id ? "text-primary-container" : "text-on-surface-variant"}`}>
                v.a. €{t.amount}
              </p>
              <ul className="space-y-0.5">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-1 text-[10px] text-on-surface-variant leading-tight">
                    <Check size={9} className="text-green-500 flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="section-label block mb-1.5">
          Bedrag <span className="normal-case font-normal text-outline">(minimaal €{selectedTier.amount})</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">€</span>
          <input
            type="number"
            value={bedrag}
            onChange={(e) => setBedrag(Number(e.target.value))}
            min={selectedTier.amount}
            step="1"
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 bg-white text-on-surface text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="section-label block mb-1.5">Jouw naam *</label>
        <input
          type="text"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          placeholder="Bijv. Familie Van Dam"
          required
          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-white text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
        />
      </div>

      {/* Email — required for vriend+ */}
      {selectedTier.requireEmail && (
        <div>
          <label className="section-label block mb-1.5">
            E-mailadres * <span className="normal-case font-normal text-outline">(voor je weekendverslag)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jouw@email.nl"
            required
            className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-white text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className="section-label block mb-1.5">
          Bericht <span className="normal-case font-normal text-outline">(optioneel)</span>
        </label>
        <textarea
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          placeholder='Bijv. "Succes jongens, wij zijn trots op jullie! 🧡"'
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-white text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !naam || !bedrag}
        className="w-full bg-primary-container text-white font-headline font-black text-sm uppercase tracking-wider py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? "Even geduld…" : <>Betaal €{bedrag} via Tikkie <ExternalLink size={16} /></>}
      </button>

      <p className="text-center text-[11px] text-outline leading-relaxed">
        Je wordt doorgestuurd naar Tikkie voor veilig betalen via iDEAL.<br />
        Je naam verschijnt daarna op de doneursmuur.
      </p>
    </form>
  );
}

function HappykidsPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-[fadeInScale_0.3s_ease-out]">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
        >
          <X size={16} />
        </button>

        <div className="text-4xl mb-4">🎉</div>

        <div className="mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_happykids.png"
            alt="HappyKids Kinderopvang"
            className="h-14 mx-auto object-contain"
          />
        </div>

        <p className="font-headline font-black text-2xl text-on-surface leading-tight mb-2">
          Wow, <span className="text-primary-container">€1.000</span> van HappyKids!
        </p>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          HappyKids Kinderopvang steunt onze jongens met een geweldige bijdrage. Hartstikke bedankt! 🧡
        </p>

        <button
          onClick={() => setDismissed(true)}
          className="mt-6 w-full bg-primary-container text-white font-headline font-black text-sm uppercase tracking-wider py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Geweldig!
        </button>
      </div>
    </div>
  );
}

type SponsorTierId = "tourpartner" | "hoofdtourpartner";

interface SponsorTier {
  id: SponsorTierId;
  label: string;
  amount: number;
  popular?: boolean;
  perks: string[];
  tikkieKey: "tourpartner" | "hoofdtourpartner";
}

const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: "tourpartner",
    label: "Tourpartner",
    amount: 750,
    tikkieKey: "tourpartner",
    perks: [
      "Foto met vlag — logo/familie op de teamfoto in Londen",
      "Social exposure — vermelding op onze social media",
      "Meedoen aan verloting gesigneerd Nederlands Elftal shirt",
    ],
  },
  {
    id: "hoofdtourpartner",
    label: "Hoofdtourpartner",
    amount: 1500,
    popular: true,
    tikkieKey: "hoofdtourpartner",
    perks: [
      "Foto met vlag — logo/familie op de teamfoto in Londen",
      "Video met logo — jouw logo in onze reisvideo",
      "Social exposure — vermelding op onze social media",
      "Meedoen aan verloting gesigneerd Nederlands Elftal shirt",
    ],
  },
];

function SponsorForm({ tikkieUrls }: { tikkieUrls: { tourpartner: string; hoofdtourpartner: string } }) {
  const [selectedTier, setSelectedTier] = useState<SponsorTierId>("hoofdtourpartner");
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const tier = SPONSOR_TIERS.find((t) => t.id === selectedTier)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) { toast.error("Vul je naam in."); return; }
    if (!email.trim()) { toast.error("Vul je e-mailadres in."); return; }

    setLoading(true);
    try {
      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: naam.trim(),
          email: email.trim(),
          company_name: bedrijfsnaam.trim() || null,
          amount: tier.amount * 100,
          type: selectedTier,
          tier: selectedTier,
          status: "pending",
        }),
      });
      setSuccess(true);
      window.open(tikkieUrls[tier.tikkieKey], "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <div>
          <p className="font-headline font-black text-xl text-on-surface">Bedankt, {naam.split(" ")[0]}!</p>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs">
            Betaal €{tier.amount} via Tikkie om je plek als {tier.label} te bevestigen. We nemen daarna contact met je op.
          </p>
        </div>
        <button
          onClick={() => window.open(tikkieUrls[tier.tikkieKey], "_blank", "noopener,noreferrer")}
          className="btn-primary flex items-center gap-2"
        >
          Open Tikkie opnieuw <ExternalLink size={14} />
        </button>
        <button onClick={() => setSuccess(false)} className="text-xs text-outline underline">
          Andere aanmelding doen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tier selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SPONSOR_TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTier(t.id)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-150 ${
              selectedTier === t.id
                ? "border-primary-container bg-primary-fixed"
                : "border-outline-variant/20 bg-white hover:border-outline-variant/40"
            }`}
          >
            {t.popular && (
              <span className="absolute -top-2 left-3 text-[9px] font-black uppercase tracking-widest bg-primary-container text-white px-2 py-0.5 rounded-full">
                Meest gekozen
              </span>
            )}
            <p className={`font-headline font-black text-sm mb-1 ${selectedTier === t.id ? "text-primary-container" : "text-on-surface"}`}>
              {t.label}
            </p>
            <p className={`text-2xl font-black font-headline leading-none mb-3 ${selectedTier === t.id ? "text-primary-container" : "text-on-surface-variant"}`}>
              €{t.amount}
            </p>
            <ul className="space-y-1">
              {t.perks.map((p) => (
                <li key={p} className="flex items-start gap-1.5 text-[10px] text-on-surface-variant leading-tight">
                  <Check size={9} className="text-green-500 flex-shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="section-label block mb-1.5">Jouw naam *</label>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Jan de Vries"
            required
            className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-white text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
          />
        </div>
        <div>
          <label className="section-label block mb-1.5">Bedrijfsnaam</label>
          <input
            type="text"
            value={bedrijfsnaam}
            onChange={(e) => setBedrijfsnaam(e.target.value)}
            placeholder="Optioneel"
            className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-white text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="section-label block mb-1.5">E-mailadres *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jouw@email.nl"
          required
          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-white text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !naam || !email}
        className="w-full bg-primary-container text-white font-headline font-black text-sm uppercase tracking-wider py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? "Even geduld…" : <>Word {tier.label} via Tikkie <ExternalLink size={16} /></>}
      </button>

      <p className="text-center text-[11px] text-outline leading-relaxed">
        Je wordt doorgestuurd naar Tikkie. Na betaling nemen we contact met je op voor de tegenprestaties.
      </p>
    </form>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  function share() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "Steun VVC Goes UK!", url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <button
      onClick={share}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container text-sm font-bold font-headline transition-colors"
    >
      {copied ? <><CheckCircle size={15} className="text-green-500" /> Link gekopieerd!</> : <><Share2 size={15} /> Deel deze pagina</>}
    </button>
  );
}

export default function DonatieClient({ raised, goal, tikkieUrls, donations }: DonatieClientProps) {
  const recentDonors = donations.slice(0, 3);
  const sponsorTikkieUrls = { tourpartner: tikkieUrls.tourpartner, hoofdtourpartner: tikkieUrls.hoofdtourpartner };

  return (
    <div>
      <HappykidsPopup />

      {/* ── THERMOMETER ─────────────────────────────────────────── */}
      <div className="mb-12">
        <DonationThermometer raised={raised} goal={goal} tikkieUrl={tikkieUrls.donatie} />
      </div>

      {/* ── SOCIAL PROOF STRIP ──────────────────────────────────── */}
      {recentDonors.length > 0 && (
        <div className="flex items-center gap-3 mb-10 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-x-auto">
          <div className="flex -space-x-2 flex-shrink-0">
            {recentDonors.map((d, i) => (
              <div
                key={d.id}
                className="w-8 h-8 rounded-full bg-primary-fixed border-2 border-white flex items-center justify-center text-xs font-black font-headline text-primary-container"
                style={{ zIndex: recentDonors.length - i }}
              >
                {d.name.charAt(0)}
              </div>
            ))}
          </div>
          <p className="text-sm text-on-surface-variant whitespace-nowrap">
            <strong className="text-on-surface">{recentDonors[0].name.split(" ")[0]}</strong>
            {recentDonors.length > 1 && <> en {donations.length - 1} anderen</>} doneerden al —{" "}
            <a href="#doneren" className="text-primary-container font-bold">doe je mee?</a>
          </p>
          <ChevronRight size={14} className="text-outline flex-shrink-0 ml-auto" />
        </div>
      )}

      {/* ── GRID: FORM + VERHAAL ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16" id="doneren">
        {/* Form — left, wider */}
        <div className="lg:col-span-3">
          <p className="section-label mb-2">Particuliere Donatie</p>
          <h2 className="text-2xl font-black font-headline text-on-surface mb-5">
            Steun de jongens <span className="text-primary-container">direct</span>
          </h2>
          <div className="card p-6">
            <DonationForm tikkieUrl={tikkieUrls.donatie} />
          </div>
        </div>

        {/* Story — right */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div>
            <p className="section-label mb-2">Waar gaat het naartoe?</p>
            <ul className="space-y-3">
              {[
                { emoji: "✈️", label: "Vluchten naar Londen", sub: "Heathrow retour" },
                { emoji: "🏨", label: "Overnachting 2 nachten", sub: "Hotel nabij stadion" },
                { emoji: "🍕", label: "Maaltijden & uitjes", sub: "Lunch, diner, snacks" },
                { emoji: "⚽", label: "Toernooi inschrijving", sub: "International Junior Cup" },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Photo */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/team-pose.jpeg"
              alt="VVC team"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold">
              🧡 Deze jongens rekenen op jou
            </p>
          </div>

          <ShareButton />
        </div>
      </div>

      {/* ── SPONSORPAKKETTEN ────────────────────────────────────── */}
      <section className="mb-8" id="sponsor">
        <p className="section-label mb-2">Zakelijk & Persoonlijk Sponsorship</p>
        <h2 className="text-2xl font-black font-headline text-on-surface mb-2">
          Word <span className="text-primary-container">tourpartner</span>
        </h2>
        <p className="text-sm text-on-surface-variant mb-6 max-w-lg">
          Steun de jongens als sponsor en krijg zichtbaarheid op de teamfoto in Londen, in onze reisvideo en op social media. Alle sponsors doen mee aan de verloting van een <strong>gesigneerd Nederlands Elftal shirt</strong>.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="card p-6">
              <SponsorForm tikkieUrls={sponsorTikkieUrls} />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5 justify-start">
            <div className="rounded-xl overflow-hidden border border-outline-variant/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/donatie-hero-banner.jpeg"
                alt="FC VVC team Londen"
                className="w-full aspect-[4/3] object-cover object-top"
              />
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Win</p>
              <p className="font-headline font-black text-on-surface">Gesigneerd Nederlands Elftal Shirt</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Onder alle sponsors verloten we een door een internationaal voetballer gesigneerd shirt. Elk pakket doet mee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DONEURSMUUR ─────────────────────────────────────────── */}
      <section className="mb-8">
        <DonorWall donations={donations} />
      </section>

    </div>
  );
}
