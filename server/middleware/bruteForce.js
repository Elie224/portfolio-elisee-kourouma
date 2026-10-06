/**
 * Middleware anti-bruteforce pour le login admin.
 *
 * Strategie :
 *  - En cas d echec (status 401 renvoye par la route login), on incremente
 *    un compteur en memoire associe a l IP.
 *  - Apres 3 echecs consecutifs dans une fenetre de 15 min, on bloque
 *    l IP pendant 15 minutes (HTTP 429).
 *  - Apres 5 echecs consecutifs, on bloque 1 heure.
 *  - Apres 10 echecs consecutifs, on bloque 24 heures.
 *  - Une connexion reussie reinitialise le compteur.
 *
 * NOTE : en production multi-instance, preferer Redis. Ici, memoire
 * locale car une seule instance Fly.
 */
const FAILED_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_TIERS = [
  { failures: 3, lockMs: 15 * 60 * 1000 },
  { failures: 5, lockMs: 60 * 60 * 1000 },
  { failures: 10, lockMs: 24 * 60 * 60 * 1000 }
];

const attempts = new Map();

function getClientIp(req) {
  return (req.ip || req.headers["x-forwarded-for"] || (req.connection && req.connection.remoteAddress) || "unknown")
    .toString()
    .substring(0, 64);
}

function getLockMs(failures) {
  let lock = 0;
  for (const tier of LOCKOUT_TIERS) {
    if (failures >= tier.failures) lock = Math.max(lock, tier.lockMs);
  }
  return lock;
}

function bruteForceProtection(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry && entry.lockedUntil && entry.lockedUntil > now) {
    const waitSec = Math.ceil((entry.lockedUntil - now) / 1000);
    res.set("Retry-After", String(waitSec));
    return res.status(429).json({
      error: "Trop de tentatives de connexion. Compte temporairement bloque.",
      retryAfter: waitSec,
      code: "BRUTE_FORCE_LOCKOUT"
    });
  }

  if (entry && now - entry.firstAt > FAILED_WINDOW_MS && (!entry.lockedUntil || entry.lockedUntil <= now)) {
    attempts.delete(ip);
  }

  const origJson = res.json.bind(res);
  res.json = function(body) {
    try {
      const isFail = res.statusCode === 401 || (body && body.success === false);
      const isSuccess = res.statusCode === 200 && body && body.success === true;
      if (isFail) {
        const cur = attempts.get(ip) || { count: 0, firstAt: now, lockedUntil: 0 };
        cur.count = (cur.count || 0) + 1;
        if (cur.firstAt === 0) cur.firstAt = now;
        const lockMs = getLockMs(cur.count);
        if (lockMs > 0) {
          cur.lockedUntil = now + lockMs;
          const waitSec = Math.ceil(lockMs / 1000);
          res.set("Retry-After", String(waitSec));
        }
        attempts.set(ip, cur);
      } else if (isSuccess) {
        attempts.delete(ip);
      }
    } catch (e) { /* no-op */ }
    return origJson(body);
  };
  next();
}

function getStats() {
  const now = Date.now();
  let locked = 0, tracked = 0;
  for (const e of attempts.values()) {
    if (e.lockedUntil && e.lockedUntil > now) locked++;
    if (e.count > 0) tracked++;
  }
  return { trackedIPs: tracked, lockedIPs: locked, totalEntries: attempts.size };
}

module.exports = { bruteForceProtection, getStats };
