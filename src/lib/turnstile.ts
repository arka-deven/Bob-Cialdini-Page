/**
 * Server-side Cloudflare Turnstile verification.
 * Returns true if the token is valid, false otherwise.
 * If Turnstile is not configured (no secret key), allows all requests (dev mode).
 */
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile is not configured, allow all (development)
  if (!secret) return true;

  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = await res.json();
    return data.success === true;
  } catch {
    console.error("Turnstile verification failed");
    return false;
  }
}
