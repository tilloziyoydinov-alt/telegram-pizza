/**
 * Oddiy IP bo'yicha limit (har bir serverless instansiya uchun alohida).
 * Ko'p trafikda Upstash Redis kabi umumiy limiterga almashtiring.
 */
export function createRateLimiter({ windowMs = 60_000, limit = 60 } = {}) {
  const hits = new Map();
  return function check(request) {
    // Vercel X-Forwarded-For'ni o'zi o'rnatadi (birinchi qiymat — haqiqiy mijoz)
    const ip = (request.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || now - entry.start > windowMs) {
      hits.set(ip, { start: now, count: 1 });
      if (hits.size > 50_000) hits.clear();
      return null;
    }
    entry.count += 1;
    if (entry.count <= limit) return null;
    const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
    return Response.json({ error: 'Juda ko‘p so‘rov. Birozdan so‘ng urinib ko‘ring.' }, {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    });
  };
}
