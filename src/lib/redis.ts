import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

// Create Redis client (with fallback for missing env vars)
export const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

export const CACHE_TTL_SECONDS = 86400; // 24 hours

// Rate limiter: 10 requests per IP per minute
export const rateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "jagafakta_rl",
    })
  : null;

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const val = await redis.get(`fact:${key}`);
    if (!val) return null;
    return typeof val === "string" ? JSON.parse(val) as T : val as T;
  } catch {
    return null;
  }
}

export async function setCache(key: string, data: unknown): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(`fact:${key}`, CACHE_TTL_SECONDS, JSON.stringify(data));
  } catch {
    // Silently fail — caching is non-critical
  }
}
