const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * @param ip - The IP address to rate limit
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
