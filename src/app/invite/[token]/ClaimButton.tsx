"use client";

import { claimInvite } from "./actions";
import { useState } from "react";

export default function ClaimButton({ token, voornaam }: { token: string; voornaam: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <form
      action={async () => {
        setLoading(true);
        await claimInvite(token);
      }}
    >
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-4 text-base disabled:opacity-60"
      >
        {loading ? "Inloggen..." : `Doorgaan als ${voornaam}`}
      </button>
    </form>
  );
}
