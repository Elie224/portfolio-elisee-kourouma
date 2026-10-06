/**
 * Middleware d authentification admin
 *
 * Strategie de verification (dans l ordre) :
 *  1) Cherche un admin actif dans MongoDB (modele Admin) par email decode du JWT
 *  2) Fallback : si pas de collection Admin peuplee, utilise les variables d environnement
 *     (mode de migration / dev local)
 *
 * - Le token JWT est signe avec audience + issuer
 * - La cle secrete doit etre longue (>= 32 caracteres) sinon refus
 */
const jwt = require('jsonwebtoken');
const { logSecurity, logError } = require('../utils/logger');
const Admin = require('../models/Admin');

const ADMIN_COOKIE_NAME = 'admin_token';

// Resolution de l admin (DB prioritaire, env en fallback)
async function resoudreAdminParEmail(email) {
  if (!email) return null;
  try {
    // Essai depuis MongoDB
    const dbAdmin = await Admin.findActiveByEmail(email);
    if (dbAdmin) return { source: 'db', admin: dbAdmin };
  } catch (e) {
    // Si la collection n existe pas encore (avant bootstrap), on continue avec env
  }
  // Fallback env : verifier que l email matche
  const envAdminEmail = process.env.ADMIN_EMAIL || null;
  const envAdminPasswordHash = process.env.ADMIN_PASSWORD_HASH || null;
  if (envAdminEmail && String(envAdminEmail).toLowerCase() === String(email).toLowerCase()) {
    return { source: 'env', admin: { email: envAdminEmail, passwordHash: envAdminPasswordHash } };
  }
  return null;
}

const authenticateAdmin = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    logError('JWT_SECRET manquant - refus de l authentification');
    return res.status(500).json({ error: 'Configuration serveur incomplete', code: 'MISSING_JWT_SECRET' });
  }
  if (String(process.env.JWT_SECRET).length < 32) {
    logError('JWT_SECRET trop court (<32 caracteres) - refus de l authentification');
    return res.status(500).json({ error: 'Configuration serveur incomplete', code: 'WEAK_JWT_SECRET' });
  }

  try {
    let token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) token = req.headers['x-auth-token'];
    if (!token) {
      logSecurity('Token manquant', { path: req.path, method: req.method, origin: req.headers.origin });
      return res.status(401).json({ error: 'Token d authentification manquant', code: 'MISSING_TOKEN' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      audience: 'portfolio-admin',
      issuer: 'portfolio-backend'
    });

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      logSecurity('Token expire', { email: decoded.email });
      return res.status(401).json({ error: 'Token expire', code: 'TOKEN_EXPIRED' });
    }

    // Resoudre l admin (DB ou env) - bloque les acces avec un email non autorise
    const resolved = await resoudreAdminParEmail(decoded.email);
    if (!resolved) {
      logSecurity('Email non autorise dans le token', { email: decoded.email });
      return res.status(403).json({ error: 'Acces refuse - Email non autorise', code: 'UNAUTHORIZED_EMAIL' });
    }

    req.admin = {
      email: resolved.admin.email,
      role: decoded.role || (resolved.admin.role || 'admin'),
      iat: decoded.iat,
      source: resolved.source
    };
    next();
  } catch (error) {
    logError('Erreur d authentification', { message: error.message, name: error.name });
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expire', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide', code: 'INVALID_TOKEN' });
    }
    return res.status(500).json({ error: 'Erreur lors de l authentification', code: 'AUTH_ERROR' });
  }
};

module.exports = {
  ADMIN_COOKIE_NAME,
  authenticateAdmin,
  resoudreAdminParEmail
};
