function secret(): string {
  return process.env.ADMIN_SECRET ?? "fallback-secret";
}

function hexEncode(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return hexEncode(sig);
}

async function sha256(data: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(data));
  return hexEncode(hash);
}

export async function hashPin(pin: string): Promise<string> {
  return sha256(pin + ":" + secret());
}

export async function signParentCookie(parentId: number): Promise<string> {
  const payload = String(parentId);
  const sig = await hmacSha256(secret(), payload);
  return `${payload}.${sig}`;
}

export async function verifyParentCookie(value: string): Promise<number | null> {
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = await hmacSha256(secret(), payload);
  if (sig !== expected) return null;
  const id = parseInt(payload, 10);
  return isNaN(id) ? null : id;
}
