/**
 * Middlewares de rate limiting partages
 *
 * Centralise la definition des limiteurs pour les rendre reutilisables
 * depuis server.js (CORS, login) et routes/portfolio.js (POST portfolio).
 */
const rateLimit = require('express-rate-limit');
const { logSecurity, logError } = require('../utils/logger');

const isDev = () => process.env.NODE_ENV === 'development';

// Limiteur general : 300 req / 15 min en prod, 1000 en dev
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev() ? 1000 : 300,
  message: { error: 'Trop de requetes', retryAfter: '15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev(),
  handler: (req, res) => {
    logSecurity(`Rate limit general atteint pour IP: ${req.ip}`, { path: req.path, method: req.method });
    res.status(429).json({ error: 'Trop de requetes', message: 'Veuillez reessayer dans 15 minutes' });
  }
});

// Limiteur strict : 5 req / 15 min en prod pour endpoints sensibles (login, contact, request-doc)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev() ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev(),
  handler: (req, res) => {
    logSecurity(`Rate limit strict atteint pour IP: ${req.ip}`, { path: req.path, method: req.method });
    res.status(429).json({ error: 'Trop de requetes', code: 'RATE_LIMIT' });
  }
});

// Limiteur auth : 5 tentatives / 15 min en prod (compteur uniquement sur les echecs grace a skipSuccessfulRequests)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev() ? 100 : 5,
  skipSuccessfulRequests: true,
  skip: () => isDev(),
  handler: (req, res) => {
    logSecurity(`Trop de tentatives auth pour IP: ${req.ip}`, { path: req.path, method: req.method });
    res.status(429).json({ error: 'Trop de tentatives de connexion', message: 'Veuillez reessayer dans 15 minutes' });
  }
});

module.exports = { generalLimiter, strictLimiter, authLimiter };
