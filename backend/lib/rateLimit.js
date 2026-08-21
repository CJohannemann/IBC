/**
 * Minimal fixed-window rate limiter, in memory.
 *
 * Deliberately not a dependency: this site runs as a single process on one box,
 * so a Map is sufficient and costs nothing. Counters reset if the process
 * restarts, which is an acceptable trade at this scale.
 *
 * If the backend is ever run as multiple processes, replace this with a shared
 * store - otherwise each process enforces its own limit.
 */
function createRateLimiter({ windowMs, max, keyFn }) {
  const hits = new Map()

  // Sweep expired entries so the Map cannot grow without bound.
  const sweep = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key)
    }
  }, windowMs)
  // Don't hold the event loop open on shutdown.
  if (sweep.unref) sweep.unref()

  function check(req) {
    const key = keyFn(req)
    const now = Date.now()
    const entry = hits.get(key)

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return { limited: false, remaining: max - 1, retryAfter: 0 }
    }

    entry.count += 1
    const limited = entry.count > max

    return {
      limited,
      remaining: Math.max(0, max - entry.count),
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  /** Forget a key - call after a success so good users aren't punished. */
  function reset(req) {
    hits.delete(keyFn(req))
  }

  return { check, reset }
}

module.exports = { createRateLimiter }
