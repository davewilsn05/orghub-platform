import { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * Note: In production, use Redis or similar for distributed rate limiting
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `rate-limit:${identifier}`;

  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { allowed: true, remaining: maxRequests - 1, resetTime: rateLimitStore[key].resetTime };
  }

  rateLimitStore[key].count++;
  const allowed = rateLimitStore[key].count <= maxRequests;
  const remaining = Math.max(0, maxRequests - rateLimitStore[key].count);

  return {
    allowed,
    remaining,
    resetTime: rateLimitStore[key].resetTime,
  };
}

/**
 * Get a rate limit identifier from the request
 * Uses IP address as the identifier
 */
export function getRateLimitIdentifier(req: NextRequest | Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded ? (forwarded.split(",")[0] ?? "unknown").trim() : "unknown";
  return ip;
}
