// Simple in-memory sliding window rate limiter.
// For production with multiple instances, replace with Upstash Redis or similar.
// This still provides protection on single-instance Vercel function concurrency per instance.
type Bucket = { count: number; resetAt: number };
const globalBuckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const b = globalBuckets.get(key);
  if (!b || now > b.resetAt) {
    globalBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }
  if (b.count >= limit) {
    return { allowed: false, remaining: 0, resetMs: b.resetAt - now };
  }
  b.count++;
  return { allowed: true, remaining: limit - b.count, resetMs: b.resetAt - now };
}

export function getClientKey(req: Request, suffix: string): string {
  // Use x-forwarded-for or x-real-ip when behind proxy
  const fwd = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const ip = fwd || req.headers.get("x-real-ip") || "unknown";
  return `rl:${ip}:${suffix}`;
}
