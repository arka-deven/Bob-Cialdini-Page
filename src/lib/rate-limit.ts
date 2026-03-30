import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only create rate limiter if Upstash credentials are configured
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

export async function rateLimit(
  limiter: Ratelimit | undefined,
  identifier: string
): Promise<{ success: boolean; remaining?: number }> {
  if (!limiter) return { success: true };

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
