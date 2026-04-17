"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle, Info } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface BusinessPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageType: "s" | "l";
  tikkieUrl: string;
}

export default function BusinessPackageModal({
  isOpen,
  onClose,
  packageType,
  tikkieUrl,
}: BusinessPackageModalProps) {
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [contactpersoon, setContactpersoon] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [appWens, setAppWens] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isLarge = packageType === "l";
  const packageLabel = isLarge ? "Custom App — €5.000" : "Website + AI — €1.500";
  const amount = isLarge ? 500000 : 150000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bedrijfsnaam.trim() || !contactpersoon.trim() || !email.trim()) {
      toast.error("Vul alle verplichte velden in.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactpersoon.trim(),
          type: isLarge ? "pakket_l" : "pakket_s",
          amount,
          company_name: bedrijfsnaam.trim(),
          company_email: email.trim(),
          company_phone: telefoon.trim() || null,
          app_wens: isLarge ? appWens.trim() || null : null,
        }),
      });

      if (!res.ok) throw new Error("API error");
      setSuccess(true);
    } catch {
      toast.error("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setBedrijfsnaam("");
    setContactpersoon("");
    setEmail("");
    setTelefoon("");
    setAppWens("");
    setSuccess(false);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={`Sponsorpakket ${packageLabel}`}
    >
      {success ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface text-lg">Aanvraag ontvangen!</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Bevestig je opdracht via Tikkie om de samenwerking te starten.
            </p>
          </div>
          <button
            onClick={() => window.open(tikkieUrl, "_blank", "noopener,noreferrer")}
            className="btn-primary flex items-center gap-2"
          >
            Bevestig opdracht via Tikkie <ExternalLink size={14} />
          </button>
          <button onClick={handleReset} className="btn-ghost text-sm">
            Sluiten
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Bedrijfsnaam *</label>
              <input
                type="text"
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
                placeholder="Acme B.V."
                required
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
              />
            </div>
            <div>
              <label className="section-label block mb-1.5">Contactpersoon *</label>
              <input
                type="text"
                value={contactpersoon}
                onChange={(e) => setContactpersoon(e.target.value)}
                placeholder="Jan de Vries"
                required
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="section-label block mb-1.5">E-mailadres *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jan@acme.nl"
              required
              className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Telefoonnummer</label>
            <input
              type="tel"
              value={telefoon}
              onChange={(e) => setTelefoon(e.target.value)}
              placeholder="+31 6 12345678"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
            />
          </div>

          {isLarge && (
            <div>
              <label className="section-label block mb-1.5">Beschrijf je app wens</label>
              <textarea
                value={appWens}
                onChange={(e) => setAppWens(e.target.value)}
                placeholder="Bijv. een reserveringssysteem voor ons restaurant..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors resize-none"
              />
            </div>
          )}

          {/* Fiscal disclaimer */}
          <div className="flex gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/20">
            <Info size={16} className="text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Dit is een zakelijke opdracht, geen donatie. Je ontvangt een factuur van{" "}
              <strong>WeAreImpact BV</strong>. Btw-aftrekbaar als marketing- of
              ICT-investering.
            </p>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Aanvraag versturen
          </Button>
        </form>
      )}
    </Modal>
  );
}
