import { Resend } from "resend";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { eq, and, isNotNull, ne } from "drizzle-orm";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM ?? "VVC Goes UK <noreply@vvcgoesuk.nl>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "chat@weareimpact.nl";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://vvcgoesuk.nl";

// ── Tikkie URL per tier ──────────────────────────────────────────
function getTikkieUrl(tier: string | null | undefined): string {
  const base = process.env.NEXT_PUBLIC_TIKKIE_DONATIE ?? "https://tikkie.me/pay/vvcgoesuk";
  const map: Record<string, string> = {
    basissponsor: process.env.NEXT_PUBLIC_TIKKIE_PAKKET_S ?? base,
    tourpartner: process.env.NEXT_PUBLIC_TIKKIE_TOURPARTNER ?? base,
    hoofdtourpartner: process.env.NEXT_PUBLIC_TIKKIE_HOOFDTOURPARTNER ?? base,
  };
  return map[tier ?? ""] ?? base;
}

// ── Tier metadata ────────────────────────────────────────────────
const TIERS: Record<string, { label: string; perks: string[] }> = {
  supporter:       { label: "Supporter",        perks: ["Naam op de donateursmuur"] },
  vriend:          { label: "Vriend",            perks: ["Naam op de donateursmuur", "Weekendverslag per mail"] },
  sponsor:         { label: "Sponsor",           perks: ["Naam op de donateursmuur", "Weekendverslag per mail", "Fotopakket na afloop"] },
  hoofdsponsor:    { label: "Hoofdsponsor",      perks: ["Naam op de donateursmuur", "Weekendverslag per mail", "Fotopakket na afloop", "Bedankkaartje van de kids"] },
  basissponsor:    { label: "Sponsor",           perks: ["Foto met vlag — logo op de teamfoto in Londen", "Social exposure — vermelding op social media"] },
  tourpartner:     { label: "Tourpartner",       perks: ["Foto met vlag — logo op de teamfoto in Londen", "Social exposure — vermelding op social media", "Verloting gesigneerd Nederlands Elftal shirt"] },
  hoofdtourpartner:{ label: "Hoofdtourpartner",  perks: ["Foto met vlag — logo op de teamfoto in Londen", "Video met logo — jouw logo in onze reisvideo", "Social exposure — vermelding op social media", "Verloting gesigneerd Nederlands Elftal shirt"] },
};

// ── Shared HTML helpers ──────────────────────────────────────────
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:0 auto;">

  <div style="background:#1B2B5E;padding:28px 32px;text-align:center;border-radius:0 0 4px 4px;">
    <div style="color:#E8723A;font-size:30px;font-weight:900;letter-spacing:-1px;line-height:1;">FC VVC</div>
    <div style="color:#ffffff;font-size:11px;letter-spacing:3px;margin-top:6px;opacity:0.75;text-transform:uppercase;">JO11-1 · Goes UK · Londen 2026</div>
  </div>

  <div style="background:#ffffff;padding:36px 32px;border-radius:0 0 12px 12px;">
    ${body}
  </div>

  <div style="padding:24px 32px;text-align:center;font-size:12px;color:#999999;line-height:1.8;">
    FC VVC Nieuw-Vennep &middot; JO11-1 &middot; London 2026<br>
    <a href="https://www.instagram.com/fcvvc.u10.londen2026" style="color:#E8723A;text-decoration:none;">@fcvvc.u10.londen2026</a>
    &nbsp;&middot;&nbsp;
    <a href="${APP_URL}/doneren" style="color:#E8723A;text-decoration:none;">vvcgoesuk.nl</a><br>
    <a href="${APP_URL}/doneren" style="color:#aaa;text-decoration:none;font-size:11px;">Uitschrijven</a><br>
    Meer info: Dick Zeldenthuis &mdash; 06-535 611 78
  </div>

</div>
</body>
</html>`;
}

function btn(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;background:#E8723A;color:#ffffff;font-weight:900;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">${label}</a>`;
}

function perklist(perks: string[]): string {
  return `<ul style="margin:0;padding:0;list-style:none;">
    ${perks.map(p => `<li style="padding:5px 0;color:#444;font-size:14px;">&#10003;&nbsp; ${p}</li>`).join("")}
  </ul>`;
}

function perkbox(perks: string[]): string {
  return `<div style="background:#FFF7F0;border:2px solid #E8723A;border-radius:12px;padding:20px 24px;margin:24px 0;">
    <div style="font-size:11px;font-weight:900;color:#E8723A;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Jouw voordelen</div>
    ${perklist(perks)}
  </div>`;
}

// ── 1. Donatie-bevestiging (particulier) ─────────────────────────
export async function sendDonationConfirmation({
  name, email, amountCents, tier,
}: {
  name: string; email: string; amountCents: number; tier: string;
}) {
  const info = TIERS[tier] ?? TIERS.supporter;
  const euros = (amountCents / 100).toFixed(0);
  const tikkieUrl = getTikkieUrl(tier);
  const voornaam = name.split(" ")[0];

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Bedankt, ${voornaam}! Je donatie van €${euros} is ontvangen 🧡`,
    html: layout(`
      <h2 style="color:#1B2B5E;font-size:22px;font-weight:900;margin:0 0 8px;">Bedankt, ${voornaam}! 🧡</h2>
      <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 4px;">
        Je aanmelding als <strong>${info.label}</strong> voor <strong>€${euros}</strong> is ontvangen.
        Betaal via Tikkie om je donatie te bevestigen — daarna verschijnt je naam op de donateursmuur.
      </p>
      ${perkbox(info.perks)}
      <div style="text-align:center;margin:28px 0;">
        ${btn(tikkieUrl, "Betaal via Tikkie →")}
      </div>
      <p style="color:#aaa;font-size:13px;text-align:center;margin:0;">
        Het JO11-1 team bedankt je van harte! ⚽
      </p>
    `),
  });
}

// ── 2. Sponsor-bevestiging (zakelijk) ───────────────────────────
export async function sendSponsorConfirmation({
  name, email, amountCents, tier, companyName,
}: {
  name: string; email: string; amountCents: number; tier: string; companyName?: string | null;
}) {
  const info = TIERS[tier] ?? TIERS.basissponsor;
  const euros = (amountCents / 100).toFixed(0);
  const tikkieUrl = getTikkieUrl(tier);
  const voornaam = name.split(" ")[0];
  const displayName = companyName ?? name;

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Welkom als ${info.label} van VVC Goes UK! 🏆`,
    html: layout(`
      <h2 style="color:#1B2B5E;font-size:22px;font-weight:900;margin:0 0 8px;">Welkom, ${voornaam}! 🏆</h2>
      <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 4px;">
        <strong>${displayName}</strong> steunt het JO11-1 team als <strong>${info.label}</strong> met <strong>€${euros}</strong>.
        Betaal via Tikkie om het sponsorship te activeren — daarna nemen we contact op voor de tegenprestaties.
      </p>
      ${perkbox(info.perks)}
      <div style="text-align:center;margin:28px 0;">
        ${btn(tikkieUrl, "Activeer sponsorship via Tikkie →")}
      </div>
      <p style="color:#aaa;font-size:13px;text-align:center;margin:0;">
        Vragen? Bel Dick Zeldenthuis via <a href="tel:0653561178" style="color:#E8723A;">06-535 611 78</a>
      </p>
    `),
  });
}

// ── 3. Admin-notificatie bij nieuwe sponsor ──────────────────────
export async function sendAdminNewSponsor({
  name, email, amountCents, tier, companyName,
}: {
  name: string; email: string; amountCents: number; tier: string; companyName?: string | null;
}) {
  const info = TIERS[tier] ?? { label: tier };
  const euros = (amountCents / 100).toFixed(0);

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Nieuwe sponsor: ${companyName ?? name} — €${euros} (${info.label})`,
    html: layout(`
      <h2 style="color:#1B2B5E;font-size:20px;font-weight:900;margin:0 0 20px;">Nieuwe sponsor aanmelding 🎉</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#999;width:130px;">Naam</td><td style="padding:8px 0;color:#222;font-weight:bold;">${name}</td></tr>
        ${companyName ? `<tr><td style="padding:8px 0;color:#999;">Bedrijf</td><td style="padding:8px 0;color:#222;font-weight:bold;">${companyName}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#999;">E-mail</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#E8723A;">${email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#999;">Pakket</td><td style="padding:8px 0;color:#E8723A;font-weight:bold;">${info.label} — €${euros}</td></tr>
      </table>
      <div style="margin-top:28px;text-align:center;">
        ${btn(`${APP_URL}/admin/donaties`, "Bekijk in admin →")}
      </div>
    `),
  });
}

// ── 4. Ouder-uitnodiging ─────────────────────────────────────────
export async function sendParentInvite({
  naam, email, kindNaam, inviteUrl, expiresAt,
}: {
  naam: string; email: string; kindNaam?: string | null; inviteUrl: string; expiresAt: Date;
}) {
  const expiry = expiresAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const voornaam = naam.split(" ")[0];

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Jouw toegang tot de VVC Goes UK app${kindNaam ? ` — ${kindNaam}` : ""}`,
    html: layout(`
      <h2 style="color:#1B2B5E;font-size:22px;font-weight:900;margin:0 0 8px;">Welkom, ${voornaam}! 👋</h2>
      <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 24px;">
        ${kindNaam ? `Jouw kind <strong>${kindNaam}</strong> gaat` : "Jouw kind gaat"} mee naar Londen met het FC VVC JO11-1 team!
        Via de knop hieronder open je de app — volg wedstrijden live, bekijk foto&apos;s en lees het reisdagboek.
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        ${btn(inviteUrl, "Open de VVC Goes UK app →")}
      </div>
      <p style="color:#aaa;font-size:13px;text-align:center;line-height:1.6;margin:0;">
        De link is geldig tot <strong>${expiry}</strong>.<br>
        Werkt de knop niet? Kopieer: <a href="${inviteUrl}" style="color:#E8723A;word-break:break-all;">${inviteUrl}</a>
      </p>
    `),
  });
}

// ── 5. Weekendverslag naar alle betaalde abonnees ────────────────
export async function sendVerslagToSubscribers(verslagHtml: string, subject: string) {
  const rows = await db
    .select({ name: donations.name, email: donations.email })
    .from(donations)
    .where(
      and(
        eq(donations.status, "betaald"),
        isNotNull(donations.email),
        ne(donations.email, ""),
      )
    );

  // Dedupliceer op e-mailadres
  const seen = new Set<string>();
  const unique = rows.filter(r => {
    if (!r.email || seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });

  if (unique.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const sub of unique) {
    try {
      await getResend().emails.send({
        from: FROM,
        to: sub.email!,
        subject,
        html: layout(`
          <h2 style="color:#1B2B5E;font-size:22px;font-weight:900;margin:0 0 20px;">VVC Goes UK &mdash; Weekendverslag 🧡</h2>
          <div style="font-size:15px;color:#333;line-height:1.75;">
            ${verslagHtml}
          </div>
          <div style="margin-top:32px;text-align:center;">
            ${btn(APP_URL, "Open de live app →")}
          </div>
        `),
      });
      sent++;
    } catch (err) {
      console.error(`[email] verslag failed for ${sub.email}:`, err);
      failed++;
    }
  }

  return { sent, failed };
}
