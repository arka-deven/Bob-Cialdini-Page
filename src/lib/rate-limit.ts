import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ----- In-memory fallback when Redis is unavailable -----
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

// Periodically clean up expired entries (every 60s)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
  }, 60_000);
}

// ----- Upstash Redis rate limiters -----
function createRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token });

  return {
    // General API rate limit: 20 requests per 10 seconds
    api: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
    }),
    // Auth rate limit: 5 attempts per minute
    auth: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
    }),
    // Stripe checkout: 3 per minute
    checkout: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "60 s"),
      analytics: true,
    }),
  };
}

export const rateLimiters = createRateLimiter();

// Fallback limits (must match the Redis config above)
const FALLBACK_LIMITS: Record<string, { max: number; windowMs: number }> = {
  api: { max: 20, windowMs: 10_000 },
  auth: { max: 5, windowMs: 60_000 },
  checkout: { max: 3, windowMs: 60_000 },
};

export async function rateLimit(
  limiter: Ratelimit | undefined,
  identifier: string,
  type: "api" | "auth" | "checkout" = "api"
): Promise<{ success: boolean; remaining?: number }> {
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      return { success: result.success, remaining: result.remaining };
    } catch (err) {
      console.error("[rate-limit] Redis failed, using in-memory fallback:", err);
    }
  }

  // In-memory fallback — protects even when Redis is down
  const limits = FALLBACK_LIMITS[type] ?? FALLBACK_LIMITS.api;
  return inMemoryLimit(identifier, limits.max, limits.windowMs);
}
