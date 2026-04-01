import { Redis } from "@upstash/redis";

// ----- Redis singleton -----
let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  _redis = new Redis({ url, token });
  return _redis;
}

// ----- Key helpers -----
const KEYS = {
  profile: (userId: string) => `profile:${userId}`,
  delphiToken: (userId: string) => `delphi_token:${userId}`,
} as const;

export { KEYS as cacheKeys };

// ----- Generic get / set / del -----

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch (err) {
    console.error("[cache] GET failed for key:", key, err);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error("[cache] SET failed for key:", key, err);
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(...keys);
  } catch (err) {
    console.error("[cache] DEL failed for keys:", keys, err);
  }
}

// ----- Profile-specific helpers -----

export interface CachedProfile {
  subscription_status: string;
  messages_used: number;
  voice_seconds_used: number;
  stripe_customer_id: string | null;
}

const PROFILE_TTL_BASE = 30; // 30 seconds base
const PROFILE_TTL_JITTER = 10; // +/- 10 seconds jitter to prevent cache stampede

/** Returns a TTL with random jitter to spread cache rebuilds across time */
function jitteredTtl(base: number, jitter: number): number {
  return base + Math.floor(Math.random() * jitter * 2) - jitter;
}

export async function getCachedProfile(
  userId: string
): Promise<CachedProfile | null> {
  return cacheGet<CachedProfile>(KEYS.profile(userId));
}

export async function setCachedProfile(
  userId: string,
  profile: CachedProfile
): Promise<void> {
  await cacheSet(KEYS.profile(userId), profile, jitteredTtl(PROFILE_TTL_BASE, PROFILE_TTL_JITTER));
}

export async function invalidateProfile(userId: string): Promise<void> {
  await cacheDel(KEYS.profile(userId));
}

// ----- Delphi token helpers -----

const DELPHI_TOKEN_TTL = 50 * 60; // 50 minutes (tokens valid for 60 min)

export async function getCachedDelphiToken(
  userId: string
): Promise<string | null> {
  return cacheGet<string>(KEYS.delphiToken(userId));
}

export async function setCachedDelphiToken(
  userId: string,
  token: string
): Promise<void> {
  await cacheSet(KEYS.delphiToken(userId), token, DELPHI_TOKEN_TTL);
}
