import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import ClaimButton from "./ClaimButton";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  const [parent] = await db
    .select()
    .from(parents)
    .where(eq(parents.invite_token, token));

  const expired =
    !parent?.token_expires_at ||
    new Date(parent.token_expires_at) < new Date();

  if (!parent || expired) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-surface-container-low">
        <div className="card max-w-sm w-full p-10 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-black font-headline text-on-surface mb-2">
            Link ongeldig
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Deze uitnodigingslink is verlopen of al gebruikt. Vraag de beheerder om een nieuwe link.
          </p>
          <Link href="/" className="btn-secondary inline-block">
            Naar de app
          </Link>
        </div>
      </main>
    );
  }

  const voornaam = parent.naam.split(" ")[0];

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-surface-container-low">
      <div className="card max-w-sm w-full p-10 text-center shadow-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="FC VVC Onder 10 Goes UK"
            width={160}
            height={72}
            className="h-16 w-auto object-contain"
            priority
          />
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚽</span>
        </div>

        {/* Welcome text */}
        <p className="section-label mb-1">Uitnodiging</p>
        <h1 className="text-2xl font-black font-headline text-on-surface mb-2">
          Hoi {voornaam}!
        </h1>
        {parent.kind_naam && (
          <p className="text-sm text-on-surface-variant mb-1">
            Volg <span className="font-bold text-on-surface">{parent.kind_naam}</span> live op de VVC London Tour
          </p>
        )}
        <p className="text-xs text-on-surface-variant mb-8">
          Scores · Foto&apos;s · Verslagen · Londen
        </p>

        <ClaimButton token={token} voornaam={voornaam} />

        <p className="text-xs text-outline mt-4">
          Je blijft 30 dagen ingelogd op dit apparaat
        </p>
      </div>
    </main>
  );
}
