/**
 * Routes API pour le Portfolio
 * 
 * Ce fichier gère toutes les routes API pour :
 * - Récupérer les données du portfolio (GET)
 * - Mettre à jour les données (POST - authentifié)
 * - Authentification admin (POST /login)
 * 
 * @author Nema Elisée Kourouma
 * @date 2026
 */

const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { authenticateAdmin, resoudreAdminParEmail, ADMIN_COOKIE_NAME } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otplib = require('otplib');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { 
  validatePortfolioData, 
  validateLoginData, 
  sanitizeData, 
  limitDataSize,
  validateContactMessage,
  validateRequestDoc,
  validateDocPassword,
  handleValidationErrors
} = require('../middleware/validation');
const {
  safeMimeFromDataUrl,
  escapeFilenameForHeader,
  titleEquals,
  ALLOWED_CV_MIMES,
  ALLOWED_DOC_MIMES
} = require('../middleware/sanitize');

// Importer le système de logging centralisé
const { log, logError, logWarn, logSecurity, logSuccess } = require('../utils/logger');

// Cache mémoire très léger pour les données publiques (évite de requêter Mongo à chaque GET)
let cachePublicPortfolio = {
  data: null,
  body: null,
  etag: null,
  ts: 0,
  maxAgeMs: 15000 // 15 secondes de fraîcheur pour combiner vitesse et cohérence
};

const buildEtag = (obj) => {
  try {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return 'W/"' + hash.toString(16) + '"';
  } catch (e) {
    return null;
  }
};

const buildPublicApiBase = (req) => {
  const configured = (process.env.BACKEND_PUBLIC_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  return `${req.protocol}://${req.get('host')}`;
};

const buildCvPublicLink = (req) => `${buildPublicApiBase(req)}/api/portfolio/cv`;
const TEMP_DOWNLOAD_AUDIENCE = 'portfolio-protected-download';
const TEMP_DOWNLOAD_ISSUER = 'portfolio-backend';
const MAX_CONTACT_MESSAGES = Number(process.env.MAX_CONTACT_MESSAGES || 500);

function isTotpEnabled() {
  return typeof process.env.ADMIN_TOTP_SECRET === 'string' && process.env.ADMIN_TOTP_SECRET.trim().length > 0;
}

async function verifyAdminOtp(otpInput) {
  if (!isTotpEnabled()) return true;
  if (typeof otpInput !== 'string' || !/^\d{6}$/.test(otpInput.trim())) {
    return false;
  }
  try {
    return await otplib.verify({
      token: otpInput.trim(),
      secret: process.env.ADMIN_TOTP_SECRET.trim(),
      window: 1,
      step: 30
    });
  } catch (e) {
    return false;
  }
}

function normalizeOrigin(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return new URL(raw).origin.toLowerCase();
  } catch (e) {
    return null;
  }
}

function buildTrustedOrigins(req) {
  const trusted = new Set();

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS
      .split(',')
      .map((entry) => normalizeOrigin(String(entry || '').trim()))
      .filter(Boolean)
      .forEach((origin) => trusted.add(origin));
  }

  if (process.env.PORTFOLIO_DOMAIN) {
    const normalized = normalizeOrigin(process.env.PORTFOLIO_DOMAIN.trim());
    if (normalized) trusted.add(normalized);
  }

  // Toujours autoriser l'origine courante (utile en proxy same-origin /api)
  const selfOrigin = normalizeOrigin(`${req.protocol}://${req.get('host')}`);
  if (selfOrigin) trusted.add(selfOrigin);

  if (process.env.NODE_ENV !== 'production') {
    ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000']
      .forEach((origin) => trusted.add(origin));
  }

  return trusted;
}

function requireTrustedAdminOrigin(req, res, next) {
  const method = String(req.method || '').toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return next();
  }

  // Si authentification par token explicite, on ne force pas le contrôle Origin.
  const hasExplicitToken = !!req.headers.authorization || !!req.headers['x-auth-token'];
  if (hasExplicitToken) {
    return next();
  }

  const trusted = buildTrustedOrigins(req);
  const origin = normalizeOrigin(req.headers.origin);
  const refererOrigin = (() => {
    const referer = req.headers.referer;
    if (!referer || typeof referer !== 'string') return null;
    try {
      return new URL(referer).origin.toLowerCase();
    } catch (e) {
      return null;
    }
  })();

  const sourceOrigin = origin || refererOrigin;
  if (!sourceOrigin || !trusted.has(sourceOrigin)) {
    logSecurity('<svg class=emoji-icon aria-hidden=true></svg> CSRF admin bloquee (origine non fiable)', {
      path: req.path,
      method,
      origin: req.headers.origin || null,
      referer: req.headers.referer || null,
      ip: req.ip
    });
    return res.status(403).json({
      error: 'Requete admin refusee',
      message: 'Origine non autorisee pour cette action',
      code: 'ADMIN_CSRF_BLOCKED'
    });
  }

  return next();
}

function getAdminCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 2 * 60 * 60 * 1000,
    path: '/'
  };
}

// Limiteur strict pour endpoints publics sensibles
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  handler: (req, res) => {
    logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Rate limit strict', { path: req.path, ip: req.ip });
    return res.status(429).json({ error: 'Trop de requêtes', code: 'RATE_LIMIT' });
  }
});

async function appendContactMessage(entry) {
  return Portfolio.findOneAndUpdate(
    {},
    {
      $push: {
        contactMessages: {
          $each: [entry],
          $slice: -Math.max(1, MAX_CONTACT_MESSAGES)
        }
      }
    },
    { upsert: true }
  );
}

// Transport mail (SMTP)
let mailTransporter = null;
function getMailTransporter() {
  if (mailTransporter) return mailTransporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logWarn('<svg class=emoji-icon aria-hidden=true></svg> SMTP non configuré : définir SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
    return null;
  }
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: !!process.env.SMTP_SECURE && process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return mailTransporter;
}

function calculerTailleBase64(dataUrl = '') {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const base64 = dataUrl.split(',').pop() || '';
  return Math.floor((base64.length * 3) / 4); // taille en octets
}

function nettoyerProjetPublic(projet) {
  const clone = { ...projet._doc || projet };
  delete clone.docFile;
  delete clone.docPasswordHash;
  clone.docAvailable = !!projet.docFile;
  return clone;
}

function construireLienTelechargement(req, projectTitle, token) {
  const base = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/api/portfolio/projects/${encodeURIComponent(projectTitle)}/download?token=${token}`;
}

async function envoyerMailMotDePasse({ to, projectTitle, downloadLink }) {
  const transporter = getMailTransporter();
  if (!transporter) {
    logWarn('<svg class=emoji-icon aria-hidden=true></svg> Mail non envoyé (SMTP non configuré)', { to, projectTitle, downloadLink });
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Accès au document du projet "${projectTitle}"`,
    html: `<p>Bonjour,</p>
           <p>Voici le lien pour télécharger le document du projet <strong>${projectTitle}</strong> (valable 1h):</p>
           <p><a href="${downloadLink}">${downloadLink}</a></p>
           <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>`
  });
}

/**
 * GET /api/portfolio - Récupérer les données du portfolio (public)
 * 
 * Cette route est accessible sans authentification et retourne toutes les données
 * du portfolio pour l'affichage sur le site web.
 * 
 * @route GET /api/portfolio
 * @access Public
 * @returns {Object} Données complètes du portfolio
 */
router.get('/', async (req, res) => {
  try {
    log('<svg class=emoji-icon aria-hidden=true></svg> GET /api/portfolio - Début de la requête');

    // Réponse immédiate depuis le cache en mémoire si encore frais
    const now = Date.now();
    if (cachePublicPortfolio.data && (now - cachePublicPortfolio.ts) < cachePublicPortfolio.maxAgeMs) {
      if (cachePublicPortfolio.etag && req.headers['if-none-match'] === cachePublicPortfolio.etag) {
        return res.status(304).end();
      }
      if (cachePublicPortfolio.etag) {
        res.set('ETag', cachePublicPortfolio.etag);
      }
      res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
      res.type('application/json');
      return res.send(cachePublicPortfolio.body || JSON.stringify(cachePublicPortfolio.data));
    }

    // Projection publique pour éviter de charger les fichiers lourds (PDF base64) et hashes
    const PUBLIC_PROJECTION = {
      'projects.docFile': 0,
      'projects.docPasswordHash': 0,
      'stages.docFile': 0,
      'stages.docPasswordHash': 0,
      'alternances.docFile': 0,
      'alternances.docPasswordHash': 0,
      'links.cv': 0,
      'links.cvFile': 0,
      contactMessages: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0
    };

    let portfolio = await Portfolio.findOne().select(PUBLIC_PROJECTION).lean();
    if (!portfolio) {
      portfolio = await Portfolio.getPortfolio();
    }

    if (!portfolio.links) portfolio.links = {};

    if (portfolio.links.cv === 'assets/CV.pdf') {
      portfolio.links.cv = '';
    }

    const cvDisponible = !!portfolio.links.cvFileSize || !!portfolio.links.cvFileName;
    if (cvDisponible) {
      portfolio.links.cv = buildCvPublicLink(req);
    }
    
    // Vérifier si des données existent (pour le logging en développement)
    const hasData = (portfolio.projects?.length > 0) || 
                   (portfolio.skills?.length > 0) || 
                   (portfolio.timeline?.length > 0) ||
                   (portfolio.personal?.photo);
    
    // Informations sur le CV (pour le debugging en développement uniquement)
    const cvInfo = portfolio.links ? {
      hasCv: !!portfolio.links.cv,
      hasCvFile: cvDisponible,
      cvType: portfolio.links.cv ? (portfolio.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileType: cvDisponible ? 'stored' : 'none',
      cvFileName: portfolio.links.cvFileName,
      cvSize: portfolio.links.cvFileSize || 0
    } : { error: 'No links object' };
    
    // Informations sur les settings (pour le debugging en développement uniquement)
    const settingsInfo = portfolio.settings ? {
      hasSettings: true,
      maintenanceEnabled: portfolio.settings.maintenance?.enabled,
      maintenanceMessage: portfolio.settings.maintenance?.message
    } : { hasSettings: false };
    
    // Logger les informations (uniquement en développement)
    log('<svg class=emoji-icon aria-hidden=true></svg> GET /api/portfolio:', {
      hasData,
      projects: portfolio.projects?.length || 0,
      skills: portfolio.skills?.length || 0,
      timeline: portfolio.timeline?.length || 0,
      hasPhoto: !!portfolio.personal?.photo,
      cvInfo: cvInfo,
      settingsInfo: settingsInfo
    });
    
    // S'assurer que les settings sont bien dans la réponse
    // Si absentes, on ajoute des valeurs par défaut pour éviter les erreurs
    if (!portfolio.settings) {
      logWarn('<svg class=emoji-icon aria-hidden=true></svg> Aucune settings dans le portfolio, ajout des valeurs par défaut');
      portfolio.settings = {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      };
    }
    
    // Version publique : retirer les données sensibles (messages de contact, fichiers CV bruts)
    const publicPortfolio = portfolio;

    // Nettoyer les projets publics (pas de doc, pas de hash)
    if (Array.isArray(publicPortfolio.projects)) {
      publicPortfolio.projects = publicPortfolio.projects.map(nettoyerProjetPublic);
    }

    // Nettoyer les stages publics (pas de rapport, pas de hash)
    if (Array.isArray(publicPortfolio.stages)) {
      publicPortfolio.stages = publicPortfolio.stages.map(stage => {
        const clone = { ...stage };
        delete clone.docFile;
        delete clone.docPasswordHash;
        clone.docAvailable = !!stage.docFile;
        return clone;
      });
    }

    // Nettoyer les alternances publiques (pas de rapport, pas de hash)
    if (Array.isArray(publicPortfolio.alternances)) {
      publicPortfolio.alternances = publicPortfolio.alternances.map(alternance => {
        const clone = { ...alternance };
        delete clone.docFile;
        delete clone.docPasswordHash;
        clone.docAvailable = !!alternance.docFile;
        return clone;
      });
    }

    // Ne renvoyer au public que les recherches marquées comme visibles
    if (Array.isArray(publicPortfolio.activeSearches)) {
      publicPortfolio.activeSearches = publicPortfolio.activeSearches.filter(item => item && item.visible !== false);
    }

    const etag = buildEtag(publicPortfolio);
    if (etag && req.headers['if-none-match'] === etag) {
      res.set('ETag', etag);
      return res.status(304).end();
    }
    if (etag) res.set('ETag', etag);
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');

    const serializedPublicPortfolio = JSON.stringify(publicPortfolio);

    // Mettre en cache la réponse pour accélérer les requêtes suivantes
    cachePublicPortfolio = {
      data: publicPortfolio,
      body: serializedPublicPortfolio,
      etag,
      ts: Date.now(),
      maxAgeMs: cachePublicPortfolio.maxAgeMs
    };

    res.type('application/json');
    res.send(serializedPublicPortfolio);
  } catch (error) {
    // Log détaillé de l'erreur pour diagnostic
    // Les erreurs sont toujours loggées même en production pour le debugging
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur lors de la récupération du portfolio:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    
    // Gestion d'erreurs spécifiques MongoDB
    // En cas d'erreur de connexion, on retourne un objet vide plutôt qu'une erreur 500
    // Cela évite d'écraser les données existantes dans le localStorage du client
    if (error.name === 'MongoServerError' || error.message.includes('MongoDB') || error.message.includes('connection')) {
      logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur MongoDB - Retour d\'un objet vide pour éviter l\'écrasement du localStorage');
      // Retourner un objet vide plutôt qu'une erreur 500 pour éviter que le frontend écrase localStorage
      return res.json({
        personal: {},
        projects: [],
        skills: [],
        links: {},
        about: {},
        timeline: [],
        activeSearches: [],
        services: [],
        certifications: [],
        faq: [],
        settings: {
          maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
          seo: { title: '', description: '', keywords: '' },
          analytics: { googleAnalytics: '' }
        }
      });
    }
    
    // Pour les autres erreurs, retourner un objet vide aussi (fallback)
    // Cela évite d'écraser les données existantes dans le localStorage du client
    logWarn('<svg class=emoji-icon aria-hidden=true></svg> Retour d\'un objet vide en cas d\'erreur pour éviter l\'écrasement du localStorage');
    res.json({
      personal: {},
      projects: [],
      skills: [],
      links: {},
      about: {},
      timeline: [],
      activeSearches: [],
      services: [],
      certifications: [],
      faq: [],
      settings: {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      }
    });
  }
});

router.get('/cv', strictLimiter, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne().select({
      'links.cv': 1,
      'links.cvFile': 1,
      'links.cvFileName': 1,
      'links.cvFileSize': 1
    }).lean();

    if (!portfolio || !portfolio.links) {
      return res.status(404).json({ error: 'CV non disponible', code: 'CV_NOT_FOUND' });
    }

    const cvFile = portfolio.links.cvFile;
    const cvLegacy = portfolio.links.cv;

    if (typeof cvFile === 'string' && cvFile.startsWith('data:')) {
      const mime = safeMimeFromDataUrl(cvFile, ALLOWED_CV_MIMES);
      if (!mime) {
        return res.status(400).json({ error: 'Type de CV non autorise', code: 'CV_INVALID_MIME' });
      }

      const commaIndex = cvFile.indexOf(',');
      if (commaIndex <= 0) {
        return res.status(400).json({ error: 'Format de CV invalide', code: 'CV_INVALID_FORMAT' });
      }

      const base64Data = cvFile.substring(commaIndex + 1);
      const fileBuffer = Buffer.from(base64Data, 'base64');
      const fileEsc = escapeFilenameForHeader(portfolio.links.cvFileName, 'cv.pdf');

      res.set('Content-Type', mime);
      res.set('Content-Disposition', `inline; filename="${fileEsc.ascii}"; filename*=UTF-8''${fileEsc.utf8}`);
      res.set('Cache-Control', 'public, max-age=300');
      return res.send(fileBuffer);
    }

    if (typeof cvLegacy === 'string' && cvLegacy && !cvLegacy.startsWith('/api/portfolio/cv') && !cvLegacy.startsWith('data:')) {
      if (cvLegacy.startsWith('http://') || cvLegacy.startsWith('https://')) {
        return res.redirect(cvLegacy);
      }
      return res.status(404).json({ error: 'CV non accessible publiquement', code: 'CV_NOT_PUBLIC' });
    }

    return res.status(404).json({ error: 'CV non disponible', code: 'CV_NOT_FOUND' });
  } catch (error) {
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur lecture CV public:', {
      message: error.message,
      name: error.name
    });
    return res.status(500).json({ error: 'Erreur serveur', code: 'CV_READ_ERROR' });
  }
});

// GET /api/portfolio/admin - Données complètes (protégées)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const portfolio = await Portfolio.getPortfolio();
    res.json(portfolio);
  } catch (error) {
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur lors de la récupération admin du portfolio:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      adminEmail: req.admin?.email,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération du portfolio',
      code: 'SERVER_ERROR'
    });
  }
});

router.get('/auth/session', authenticateAdmin, async (req, res) => {
  res.json({
    authenticated: true,
    user: {
      email: req.admin.email,
      role: req.admin.role || 'admin'
    }
  });
});

/**
 * POST /api/portfolio - Mettre à jour les données du portfolio (admin seulement)
 * 
 * Cette route nécessite une authentification admin valide et permet de mettre à jour
 * toutes les données du portfolio (projets, compétences, timeline, etc.)
 * 
 * @route POST /api/portfolio
 * @access Private (Admin uniquement)
 * @middleware authenticateAdmin, validatePortfolioData, sanitizeData, limitDataSize
 * @returns {Object} Portfolio mis à jour
 */
router.post('/', 
  limitDataSize,
  sanitizeData,
  authenticateAdmin, 
  requireTrustedAdminOrigin,
  validatePortfolioData,
  async (req, res) => {
  try {
    logSuccess('<svg class=emoji-icon aria-hidden=true></svg> Requête de mise à jour reçue de:', { email: req.admin.email });

    const bodyKeys = Object.keys(req.body || {}).filter((key) => req.body[key] !== undefined);
    const partialMode = typeof req.query.partial === 'string' ? req.query.partial.trim().toLowerCase() : '';
    const certOnlyPayload = bodyKeys.length > 0 && bodyKeys.every((key) => key === 'certifications');
    const aboutOnlyPayload = bodyKeys.length > 0 && bodyKeys.every((key) => key === 'about');
    const linksOnlyPayload = bodyKeys.length > 0 && bodyKeys.every((key) => key === 'links');

    if (partialMode === 'about' || aboutOnlyPayload) {
      const about = (req.body?.about && typeof req.body.about === 'object') ? req.body.about : {};

      const portfolioMisAJour = await Portfolio.findOneAndUpdate(
        {},
        { $set: { about } },
        { new: true, upsert: true, runValidators: false }
      );

      cachePublicPortfolio = { data: null, etag: null, ts: 0, maxAgeMs: cachePublicPortfolio.maxAgeMs };

      return res.json({
        success: true,
        message: 'Section about mise à jour avec succès',
        portfolio: { about: portfolioMisAJour?.about || about }
      });
    }

    if (partialMode === 'certifications' || certOnlyPayload) {
      const certificationsRecues = Array.isArray(req.body.certifications)
        ? req.body.certifications.map((item) => ({
            ...(item && typeof item === 'object' ? item : {}),
            name: typeof item?.name === 'string' ? item.name : '',
            issuer: typeof item?.issuer === 'string' ? item.issuer : '',
            date: typeof item?.date === 'string' ? item.date : '',
            description: typeof item?.description === 'string' ? item.description : '',
            link: typeof item?.link === 'string' ? item.link : '',
            photo: typeof item?.photo === 'string' ? item.photo : '',
            image: typeof item?.image === 'string' ? item.image : '',
            document: typeof item?.document === 'string' ? item.document : ''
          }))
        : [];

      const portfolioExistant = await Portfolio.findOne().select({ certifications: 1 }).lean();
      const certificationsExistantes = Array.isArray(portfolioExistant?.certifications) ? portfolioExistant.certifications : [];

      const certifications = certificationsRecues.map((item, idx) => {
        const id = item && (item._id || item.id);
        const existant = certificationsExistantes.find(e => e && (String(e._id) === String(id) || String(e.id) === String(id))) || certificationsExistantes[idx];
        if (!existant) return item;

        return {
          ...item,
          photo: item.photo || existant.photo || '',
          image: item.image || existant.image || '',
          document: item.document || existant.document || ''
        };
      });

      await Portfolio.findOneAndUpdate(
        {},
        { $set: { certifications } },
        { new: true, upsert: true, runValidators: false }
      );

      cachePublicPortfolio = { data: null, etag: null, ts: 0, maxAgeMs: cachePublicPortfolio.maxAgeMs };

      return res.json({
        success: true,
        message: 'Certifications mises à jour avec succès',
        portfolio: { certifications }
      });
    }

    if (partialMode === 'links' || linksOnlyPayload) {
      const liensExistants = await Portfolio.findOne().select({ links: 1 }).lean();
      const socialRecus = Array.isArray(req.body?.links?.social)
        ? req.body.links.social
            .map((item) => ({
              name: typeof item?.name === 'string' ? item.name.trim() : '',
              url: typeof item?.url === 'string' ? item.url.trim() : ''
            }))
            .filter((item) => {
              if (!item.name || !item.url) return false;
              const nom = item.name.toLowerCase();
              const url = item.url.toLowerCase();
              return nom !== 'twitter' && nom !== 'x' && !url.includes('twitter.com') && !url.includes('x.com');
            })
        : (liensExistants?.links?.social || []);

      const links = {
        ...(liensExistants?.links || {}),
        ...(req.body?.links && typeof req.body.links === 'object' ? req.body.links : {}),
        social: socialRecus
      };

      const portfolioMisAJour = await Portfolio.findOneAndUpdate(
        {},
        { $set: { links } },
        { new: true, upsert: true, runValidators: false }
      );

      cachePublicPortfolio = { data: null, etag: null, ts: 0, maxAgeMs: cachePublicPortfolio.maxAgeMs };

      return res.json({
        success: true,
        message: 'Liens mis à jour avec succès',
        portfolio: { links: portfolioMisAJour?.links || links }
      });
    }

    // Récupérer un snapshot allégé pour limiter la mémoire pendant les updates
    const portfolioActuel = await Portfolio.findOne().select({
      projects: 1,
      certifications: 1,
      stages: 1,
      alternances: 1,
      services: 1,
      links: 1
    }).lean();

    // Diagnostic : résumé des fichiers reçus (stages/alternances) avant merge
    const diagPayload = (items = []) => (Array.isArray(items) ? items.map((x, i) => ({
      idx: i,
      hasDoc: !!x?.docFile,
      docSize: x?.docFile ? (x.docFileSize || (x.docFile.split(',')[1]?.length || 0)) : 0,
      hasPhoto: !!x?.photo,
      photoPreview: x?.photo ? x.photo.substring(0, 30) : ''
    })) : []);
    log('<svg class=emoji-icon aria-hidden=true></svg> Payload stages reçu (avant merge):', diagPayload(req.body.stages));
    log('<svg class=emoji-icon aria-hidden=true></svg> Payload alternances reçu (avant merge):', diagPayload(req.body.alternances));
    
    // Vérifier les settings reçues dans req.body (logging en développement uniquement)
    if (req.body.settings) {
      log('<svg class=emoji-icon aria-hidden=true></svg> Settings reçues dans req.body:', {
        hasSettings: true,
        maintenanceEnabled: req.body.settings.maintenance?.enabled,
        maintenanceMessage: req.body.settings.maintenance?.message,
        settingsKeys: Object.keys(req.body.settings)
      });
    } else {
      logWarn('<svg class=emoji-icon aria-hidden=true></svg> Aucune settings dans req.body');
    }
    
    // Préparation des données (la validation a déjà été faite par les middlewares)
    const updateData = {
      personal: (req.body.personal !== undefined) ? req.body.personal : (portfolioActuel?.personal || {}),
      projects: Array.isArray(req.body.projects) ? req.body.projects : (portfolioActuel?.projects || []),
      skills: Array.isArray(req.body.skills) ? req.body.skills : (portfolioActuel?.skills || []),
      links: (req.body.links !== undefined) ? req.body.links : (portfolioActuel?.links || {}),
      about: (req.body.about !== undefined) ? req.body.about : (portfolioActuel?.about || {}),
      timeline: Array.isArray(req.body.timeline) ? req.body.timeline : (portfolioActuel?.timeline || []),
      activeSearches: Array.isArray(req.body.activeSearches) ? req.body.activeSearches : (portfolioActuel?.activeSearches || []),
      services: Array.isArray(req.body.services) ? req.body.services : (portfolioActuel?.services || []),
      certifications: Array.isArray(req.body.certifications) ? req.body.certifications : (portfolioActuel?.certifications || []),
      testimonials: Array.isArray(req.body.testimonials) ? req.body.testimonials : (portfolioActuel?.testimonials || []),
      stages: Array.isArray(req.body.stages) ? req.body.stages : (portfolioActuel?.stages || []),
      alternances: Array.isArray(req.body.alternances) ? req.body.alternances : (portfolioActuel?.alternances || []),
      techEvents: Array.isArray(req.body.techEvents) ? req.body.techEvents : (portfolioActuel?.techEvents || []),
      contactMessages: Array.isArray(req.body.contactMessages) ? req.body.contactMessages : (portfolioActuel?.contactMessages || []),
      faq: Array.isArray(req.body.faq) ? req.body.faq : (portfolioActuel?.faq || []),
      settings: (req.body.settings !== undefined) ? req.body.settings : (portfolioActuel?.settings || {})
    };

    // Normaliser les photos de services (compatibilité photo/image)
    if (Array.isArray(updateData.services)) {
      updateData.services = updateData.services.map(service => {
        const photoValue = service?.photo || service?.image || '';
        return {
          ...service,
          photo: photoValue,
          image: photoValue
        };
      });
    }
    
    // S'assurer que les settings sont bien présentes
    // Si absentes, on utilise des valeurs par défaut pour éviter les erreurs
    if (!updateData.settings || Object.keys(updateData.settings).length === 0) {
      logWarn('<svg class=emoji-icon aria-hidden=true></svg> Settings vides ou absentes, utilisation des valeurs par défaut');
      updateData.settings = {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      };
    }

    // Préserver doc/photo existants si non renvoyés par le front (évite écrasement silencieux)
    const mergeExistingFileData = (nouveaux = [], existants = [], options = {}) => {
      if (!Array.isArray(nouveaux) || !Array.isArray(existants)) return nouveaux;
      return nouveaux.map((item, idx) => {
        const merged = { ...item };
        const id = item && (item._id || item.id);
        const existant = existants.find(e => e && (String(e._id) === String(id) || String(e.id) === String(id))) || existants[idx];

        if (existant) {
          if (!merged.docFile && existant.docFile) {
            merged.docFile = existant.docFile;
            merged.docFileName = existant.docFileName;
            merged.docFileSize = existant.docFileSize;
          }

          if (!merged.docPasswordHash && existant.docPasswordHash && !merged.docPassword) {
            merged.docPasswordHash = existant.docPasswordHash;
          }

          if (options.preservePhoto && !merged.photo && existant.photo) {
            merged.photo = existant.photo;
          }

          if (options.preserveImage && !merged.image && existant.image) {
            merged.image = existant.image;
          }

          if (options.preserveDocument && !merged.document && existant.document) {
            merged.document = existant.document;
          }
        }

        return merged;
      });
    };

    if (portfolioActuel) {
      updateData.projects = mergeExistingFileData(updateData.projects, portfolioActuel.projects || []);
      updateData.certifications = mergeExistingFileData(updateData.certifications, portfolioActuel.certifications || [], { preservePhoto: true, preserveImage: true, preserveDocument: true });
      updateData.stages = mergeExistingFileData(updateData.stages, portfolioActuel.stages || [], { preservePhoto: true });
      updateData.alternances = mergeExistingFileData(updateData.alternances, portfolioActuel.alternances || [], { preservePhoto: true });
      updateData.services = mergeExistingFileData(updateData.services, portfolioActuel.services || [], { preservePhoto: true, preserveImage: true });
    }

    // Diagnostic : résumé des données après merge
    log('<svg class=emoji-icon aria-hidden=true></svg> Stages après merge:', diagPayload(updateData.stages));
    log('<svg class=emoji-icon aria-hidden=true></svg> Alternances après merge:', diagPayload(updateData.alternances));
    
    // Gestion des documents protégés sur les projets
    try {
      if (Array.isArray(updateData.projects)) {
        updateData.projects = updateData.projects.map((projet, idx) => {
          const copie = { ...projet };
          if (copie.docFile) {
            const taille = copie.docFileSize || calculerTailleBase64(copie.docFile);
            if (taille > 50 * 1024 * 1024) {
              throw new Error(`DOC_TOO_LARGE_${idx}`);
            }
            copie.docFileSize = taille;
          }
          if (copie.docPassword) {
            copie.docPasswordHash = bcrypt.hashSync(copie.docPassword, 10);
            delete copie.docPassword;
          }
          return copie;
        });
      }

      // Gestion des rapports protégés sur les stages
      if (Array.isArray(updateData.stages)) {
        updateData.stages = updateData.stages.map((stage, idx) => {
          const copie = { ...stage };
          if (copie.docFile) {
            const taille = copie.docFileSize || calculerTailleBase64(copie.docFile);
            if (taille > 50 * 1024 * 1024) {
              throw new Error(`STAGE_DOC_TOO_LARGE_${idx}`);
            }
            copie.docFileSize = taille;
          }
          if (copie.docPassword) {
            copie.docPasswordHash = bcrypt.hashSync(copie.docPassword, 10);
            delete copie.docPassword;
          }
          return copie;
        });
      }

      // Gestion des rapports protégés sur les alternances
      if (Array.isArray(updateData.alternances)) {
        updateData.alternances = updateData.alternances.map((alternance, idx) => {
          const copie = { ...alternance };
          if (copie.docFile) {
            const taille = copie.docFileSize || calculerTailleBase64(copie.docFile);
            if (taille > 50 * 1024 * 1024) {
              throw new Error(`ALTERNANCE_DOC_TOO_LARGE_${idx}`);
            }
            copie.docFileSize = taille;
          }
          if (copie.docPassword) {
            copie.docPasswordHash = bcrypt.hashSync(copie.docPassword, 10);
            delete copie.docPassword;
          }
          return copie;
        });
      }
    } catch (err) {
      if (err.message && err.message.startsWith('DOC_TOO_LARGE')) {
        return res.status(400).json({ error: 'Le document dépasse la limite de 50 Mo', code: 'DOC_TOO_LARGE' });
      }
      if (err.message && err.message.startsWith('STAGE_DOC_TOO_LARGE')) {
        return res.status(400).json({ error: 'Le rapport de stage dépasse la limite de 50 Mo', code: 'STAGE_DOC_TOO_LARGE' });
      }
      if (err.message && err.message.startsWith('ALTERNANCE_DOC_TOO_LARGE')) {
        return res.status(400).json({ error: 'Le rapport d\'alternance dépasse la limite de 50 Mo', code: 'ALTERNANCE_DOC_TOO_LARGE' });
      }
      logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur traitement document projet:', err);
      return res.status(400).json({ error: 'Erreur lors du traitement du document du projet' });
    }

    // Normaliser les données CV et protéger le base64 existant
    if (updateData.links) {
      if (typeof updateData.links.cvFileName === 'string') {
        const nomCv = updateData.links.cvFileName.trim();
        if (nomCv.startsWith('data:')) {
          updateData.links.cvFileName = 'cv.pdf';
        } else {
          updateData.links.cvFileName = nomCv.slice(0, 200);
        }
      }

      if (updateData.links.cvFile && updateData.links.cvFile.startsWith('data:') && !updateData.links.cvFileName) {
        updateData.links.cvFileName = 'cv.pdf';
      }

      // Supprimer les placeholders hérités (ancien assets/CV.pdf)
      if (updateData.links.cv === 'assets/CV.pdf') {
        delete updateData.links.cv;
      }

      if (portfolioActuel && portfolioActuel.links) {
        // Si un CV base64 existe déjà et qu'aucun nouveau CV n'est fourni, conserver l'existant
        if (portfolioActuel.links.cvFile && portfolioActuel.links.cvFile.startsWith('data:')) {
          const cvCourant = typeof updateData.links.cv === 'string' ? updateData.links.cv.trim() : '';
          const cvApiPlaceholder = cvCourant === '/api/portfolio/cv' || /\/api\/portfolio\/cv$/i.test(cvCourant);
          const noNewCv = !updateData.links.cvFile && (!cvCourant || cvApiPlaceholder);
          if (noNewCv) {
            updateData.links.cvFile = portfolioActuel.links.cvFile;
            updateData.links.cv = '/api/portfolio/cv';
            updateData.links.cvFileName = portfolioActuel.links.cvFileName;
            updateData.links.cvFileSize = portfolioActuel.links.cvFileSize;
          }
        }
        // Si les nouvelles données ont un CV base64, s'assurer qu'il remplace bien l'ancien
        else if (updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
          logSuccess('<svg class=emoji-icon aria-hidden=true></svg> Nouveau CV base64 détecté - Remplacement de l\'ancien');
          if (!updateData.links.cvFileSize) {
            updateData.links.cvFileSize = calculerTailleBase64(updateData.links.cvFile);
          }
          updateData.links.cv = '/api/portfolio/cv';
        }
      }

      if (updateData.links.cv && typeof updateData.links.cv === 'string' && updateData.links.cv.startsWith('data:')) {
        updateData.links.cv = '/api/portfolio/cv';
      }
    }
    
    // Informations sur le CV à sauvegarder (logging en développement uniquement)
    if (updateData.links) {
      log('<svg class=emoji-icon aria-hidden=true></svg> CV dans les données à sauvegarder:', {
        hasCv: !!updateData.links.cv,
        hasCvFile: !!updateData.links.cvFile,
        cvType: updateData.links.cv ? (updateData.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
        cvFileType: updateData.links.cvFile ? (updateData.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
        cvFileName: updateData.links.cvFileName,
        cvSize: updateData.links.cvFile ? updateData.links.cvFile.length : 0
      });
    }

    // Résumé des données à sauvegarder (logging en développement uniquement)
    log('<svg class=emoji-icon aria-hidden=true></svg> Données validées à sauvegarder:', {
      projects: updateData.projects.length,
      skills: updateData.skills.length,
      timeline: updateData.timeline.length,
      hasPersonal: !!updateData.personal,
      hasAbout: !!updateData.about,
      hasSettings: !!updateData.settings,
      maintenanceEnabled: updateData.settings?.maintenance?.enabled,
      maintenanceMessage: updateData.settings?.maintenance?.message,
      admin: req.admin.email
    });
    
    // PROTECTION CRITIQUE : S'assurer que le CV base64 est bien inclus dans updateData
    // Si updateData.links contient un CV base64, s'assurer qu'il est bien sauvegardé
    // Cette protection évite la perte de données importantes
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Protection CV base64 activée - Vérification avant sauvegarde:', {
        cvFileLength: updateData.links.cvFile.length,
        cvFileStartsWith: updateData.links.cvFile.substring(0, 30),
        cvFileName: updateData.links.cvFileName,
        cvFileSize: updateData.links.cvFileSize
      });
      
      updateData.links.cv = '/api/portfolio/cv';
    }
    
    // Vérification des settings avant sauvegarde (logging en développement uniquement)
    if (updateData.settings) {
      log('<svg class=emoji-icon aria-hidden=true></svg> Settings reçues pour sauvegarde:', {
        hasSettings: true,
        maintenanceEnabled: updateData.settings.maintenance?.enabled,
        maintenanceMessage: updateData.settings.maintenance?.message
      });
    } else {
      logWarn('<svg class=emoji-icon aria-hidden=true></svg> Aucune settings reçue dans updateData');
    }
    
    // Mettre à jour directement avec findOneAndUpdate
    // Utiliser $set pour mettre à jour tous les champs, y compris links avec le CV base64 et settings
    let portfolio = await Portfolio.findOneAndUpdate(
      {}, // Pas de filtre spécifique, on veut le document unique
      { $set: updateData },
      { 
        new: true, // Retourner le document mis à jour
        upsert: true, // Créer si n'existe pas
        runValidators: false // Pas de validation spéciale
      }
    );
    
    // VÉRIFICATION CRITIQUE : Vérifier que le CV base64 a bien été sauvegardé
    // Cette vérification est importante pour s'assurer que les données importantes ne sont pas perdues
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      const cvSauvegarde = portfolio.links;
      if (!cvSauvegarde || !cvSauvegarde.cvFile || !cvSauvegarde.cvFile.startsWith('data:')) {
        logError('<svg class=emoji-icon aria-hidden=true></svg> ERREUR CRITIQUE: Le CV base64 n\'a PAS été sauvegardé dans MongoDB !');
        logError('CV envoyé:', {
          length: updateData.links.cvFile.length,
          startsWith: updateData.links.cvFile.substring(0, 30)
        });
        logError('CV dans portfolio après sauvegarde:', {
          hasLinks: !!cvSauvegarde,
          hasCvFile: !!cvSauvegarde?.cvFile,
          cvFileType: cvSauvegarde?.cvFile ? (cvSauvegarde.cvFile.startsWith('data:') ? 'base64' : 'other') : 'none'
        });
        
        // TENTATIVE DE RÉCUPÉRATION : Réessayer avec une mise à jour explicite du CV
        // Cette tentative permet de récupérer les données en cas d'échec initial
        log('<svg class=emoji-icon aria-hidden=true></svg> Tentative de récupération - Mise à jour explicite du CV...');
        const portfolioRecupere = await Portfolio.findOneAndUpdate(
          {},
          { 
            $set: { 
              'links.cvFile': updateData.links.cvFile,
              'links.cv': '/api/portfolio/cv',
              'links.cvFileName': updateData.links.cvFileName,
              'links.cvFileSize': updateData.links.cvFileSize
            }
          },
          { new: true }
        );
        
        if (portfolioRecupere && portfolioRecupere.links && portfolioRecupere.links.cvFile && portfolioRecupere.links.cvFile.startsWith('data:')) {
          logSuccess('<svg class=emoji-icon aria-hidden=true></svg> CV base64 récupéré avec succès après tentative de récupération');
          portfolio = portfolioRecupere;
        } else {
          logError('<svg class=emoji-icon aria-hidden=true></svg> ÉCHEC: Impossible de sauvegarder le CV base64 même après tentative de récupération');
        }
      } else {
        logSuccess('<svg class=emoji-icon aria-hidden=true></svg> CV base64 confirmé sauvegardé dans MongoDB:', {
          cvFileLength: cvSauvegarde.cvFile.length,
          cvLength: cvSauvegarde.cv ? cvSauvegarde.cv.length : 0,
          cvFileName: cvSauvegarde.cvFileName
        });
      }
    }
    
    // Log pour déboguer le CV après sauvegarde
    const cvInfoAfter = portfolio.links ? {
      hasCv: !!portfolio.links.cv,
      hasCvFile: !!portfolio.links.cvFile,
      cvType: portfolio.links.cv ? (portfolio.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileType: portfolio.links.cvFile ? (portfolio.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileName: portfolio.links.cvFileName,
      cvSize: portfolio.links.cvFile ? portfolio.links.cvFile.length : 0
    } : { error: 'No links object' };
    
    // Vérifier que les settings sont bien sauvegardées
    const settingsInfo = portfolio.settings ? {
      hasSettings: true,
      maintenanceEnabled: portfolio.settings.maintenance?.enabled,
      maintenanceMessage: portfolio.settings.maintenance?.message,
      hasSeo: !!portfolio.settings.seo,
      hasAnalytics: !!portfolio.settings.analytics
    } : { hasSettings: false };
    
    // Confirmation de la mise à jour réussie (logging en développement uniquement)
    logSuccess('<svg class=emoji-icon aria-hidden=true></svg> Portfolio mis à jour avec succès:', {
      projects: portfolio.projects?.length || 0,
      skills: portfolio.skills?.length || 0,
      timeline: portfolio.timeline?.length || 0,
      cvInfo: cvInfoAfter,
      settingsInfo: settingsInfo
    });
    
    // VÉRIFICATION FINALE : S'assurer que le CV base64 et les settings sont bien dans la réponse
    const portfolioObj = portfolio.toObject();
    delete portfolioObj._id;
    delete portfolioObj.__v;
    delete portfolioObj.createdAt;
    delete portfolioObj.updatedAt;
    
    // VÉRIFICATION CRITIQUE : S'assurer que les settings sont bien dans la réponse
    // Cette vérification garantit que les données importantes ne sont pas perdues
    if (updateData.settings) {
      if (!portfolioObj.settings) {
        logError('<svg class=emoji-icon aria-hidden=true></svg> ERREUR: Les settings n\'ont pas été sauvegardées dans MongoDB !');
        logError('Settings envoyées:', {
          maintenanceEnabled: updateData.settings.maintenance?.enabled,
          maintenanceMessage: updateData.settings.maintenance?.message
        });
        
        // Forcer les settings dans la réponse pour éviter la perte de données
        portfolioObj.settings = updateData.settings;
        logWarn('<svg class=emoji-icon aria-hidden=true></svg> Settings forcées dans la réponse (problème de sauvegarde MongoDB détecté)');
      } else {
        // Vérifier que les settings sont correctes
        // Double vérification pour s'assurer de la cohérence
        if (updateData.settings.maintenance?.enabled !== portfolioObj.settings.maintenance?.enabled) {
          logError('<svg class=emoji-icon aria-hidden=true></svg> ERREUR: Le mode maintenance ne correspond pas !');
          logError('Attendu:', updateData.settings.maintenance?.enabled);
          logError('Reçu:', portfolioObj.settings.maintenance?.enabled);
          
          // Forcer les settings correctes pour maintenir la cohérence
          portfolioObj.settings = updateData.settings;
          logWarn('<svg class=emoji-icon aria-hidden=true></svg> Settings corrigées dans la réponse');
        } else {
          logSuccess('<svg class=emoji-icon aria-hidden=true></svg> Settings confirmées dans la réponse:', {
            maintenanceEnabled: portfolioObj.settings.maintenance?.enabled,
            maintenanceMessage: portfolioObj.settings.maintenance?.message
          });
        }
      }
    }
    
    // Vérification critique : Si un CV base64 a été envoyé, il doit être dans la réponse
    // Cette vérification est cruciale car le CV est une donnée importante qui ne doit pas être perdue
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      if (!portfolioObj.links || !portfolioObj.links.cvFile || !portfolioObj.links.cvFile.startsWith('data:')) {
        logError('<svg class=emoji-icon aria-hidden=true></svg> ERREUR CRITIQUE: Le CV base64 n\'est pas dans la réponse !');
        logError('CV envoyé (premiers 50 chars):', updateData.links.cvFile.substring(0, 50));
        logError('CV dans réponse:', portfolioObj.links?.cvFile ? portfolioObj.links.cvFile.substring(0, 50) : 'undefined');
        
        // Forcer le CV base64 dans la réponse même si MongoDB ne l'a pas sauvegardé
        // Cette correction permet de maintenir la cohérence même en cas de problème MongoDB
        if (!portfolioObj.links) portfolioObj.links = {};
        portfolioObj.links.cvFile = updateData.links.cvFile;
        portfolioObj.links.cv = updateData.links.cv;
        portfolioObj.links.cvFileName = updateData.links.cvFileName;
        portfolioObj.links.cvFileSize = updateData.links.cvFileSize;
        
        logWarn('<svg class=emoji-icon aria-hidden=true></svg> CV base64 forcé dans la réponse (problème de sauvegarde MongoDB détecté)');
      } else {
        logSuccess('<svg class=emoji-icon aria-hidden=true></svg> CV base64 confirmé dans la réponse:', {
          cvFileLength: portfolioObj.links.cvFile.length,
          cvFileName: portfolioObj.links.cvFileName
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Portfolio mis à jour avec succès',
      portfolio: portfolioObj
    });

    // Invalider le cache public pour servir les données à jour
    cachePublicPortfolio = { data: null, etag: null, ts: 0, maxAgeMs: cachePublicPortfolio.maxAgeMs };
    
  } catch (error) {
    // Log détaillé de l'erreur pour diagnostic
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur lors de la mise à jour:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      adminEmail: req.admin?.email,
      timestamp: new Date().toISOString()
    });
    
    // Gestion d'erreurs spécifiques
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Erreur de validation des données',
        message: 'Les données fournies ne respectent pas le schéma requis',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
    } else if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Erreur de format des données',
        message: 'Un ou plusieurs champs ont un format incorrect',
        field: error.path,
        code: 'CAST_ERROR'
      });
    } else if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return res.status(409).json({
          error: 'Conflit de données',
          message: 'Une entrée avec ces données existe déjà',
          code: 'DUPLICATE_ERROR'
        });
      } else if (error.message.includes('connection') || error.message.includes('timeout')) {
        return res.status(503).json({
          error: 'Service temporairement indisponible',
          message: 'La base de données est temporairement indisponible. Veuillez réessayer dans quelques instants.',
          code: 'DATABASE_ERROR'
        });
      }
    }
    
    // Erreur générique
    return res.status(500).json({
      error: 'Erreur serveur lors de la mise à jour',
      message: 'Une erreur inattendue s\'est produite',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/portfolio/login - Authentification admin sécurisée
router.post('/login', limitDataSize, sanitizeData, validateLoginData, async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    
    // Validation des champs obligatoires
    // Vérification basique avant de faire des opérations coûteuses
    if (!email || !password) {
      logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Tentative de connexion sans email ou mot de passe');
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }
    
    const adminResolved = await resoudreAdminParEmail(email);
    if (!adminResolved || !adminResolved.admin || !adminResolved.admin.passwordHash) {
      logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Tentative de connexion avec email invalide:', { email: email });
      return res.status(401).json({ 
        error: 'Identifiants invalides' 
      });
    }
    
    // Vérification du mot de passe avec bcrypt
    // Utilisation de bcrypt pour comparer le hash de manière sécurisée
    let isValidPassword = false;
    isValidPassword = await bcrypt.compare(password, adminResolved.admin.passwordHash);
    
    if (!isValidPassword) {
      logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Mot de passe incorrect pour:', { email: email });
      return res.status(401).json({ 
        error: 'Identifiants invalides' 
      });
    }

    if (isTotpEnabled()) {
      const otpNettoye = typeof otp === 'string' ? otp.trim() : '';
      if (!/^\d{6}$/.test(otpNettoye)) {
        return res.status(401).json({
          error: 'Code OTP requis',
          code: 'MFA_REQUIRED'
        });
      }
    }

    // Vérification OTP (MFA) optionnelle: activée uniquement si ADMIN_TOTP_SECRET est défini.
    if (!(await verifyAdminOtp(otp))) {
      logSecurity('<svg class=emoji-icon aria-hidden=true></svg> OTP invalide pour la connexion admin', { email: email });
      return res.status(401).json({
        error: 'Identifiants invalides'
      });
    }
    
    // Génération du token JWT
    const jwt = require('jsonwebtoken');
    if (!process.env.JWT_SECRET) {
      logError('<svg class=emoji-icon aria-hidden=true></svg> JWT_SECRET manquant - impossible de signer le token');
      return res.status(500).json({ error: 'Configuration JWT manquante', code: 'MISSING_JWT_SECRET' });
    }

    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(
      { 
        email: email,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { expiresIn: '2h', audience: 'portfolio-admin', issuer: 'portfolio-backend' }
    );

    res.cookie(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
    
    if (adminResolved.source === 'db' && adminResolved.admin.save) {
      try {
        adminResolved.admin.lastLoginAt = new Date();
        adminResolved.admin.lastLoginIp = req.ip;
        await adminResolved.admin.save();
      } catch (e) {
        logWarn('<svg class=emoji-icon aria-hidden=true></svg> Impossible de mettre à jour lastLogin admin', { email });
      }
    }

    logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Connexion admin réussie:', { email: email, source: adminResolved.source });
    res.json({ 
      token,
      success: true, 
      expiresIn: '2h',
      mfaEnabled: isTotpEnabled(),
      user: { email, role: 'admin' }
    });
    
  } catch (error) {
    // Log détaillé de l'erreur pour diagnostic
    // Les erreurs sont toujours loggées même en production
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur lors de la connexion:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'authentification',
      code: 'AUTH_ERROR'
    });
  }
});

router.post('/auth/logout', (req, res) => {
  // Logout protégé contre les requêtes cross-site involontaires.
  // On applique la même garde d'origine que pour les actions admin sensibles.
  if (process.env.NODE_ENV === 'production') {
    const trusted = buildTrustedOrigins(req);
    const origin = normalizeOrigin(req.headers.origin);
    const referer = req.headers.referer ? normalizeOrigin(req.headers.referer) : null;
    const source = origin || referer;
    if (!source || !trusted.has(source)) {
      return res.status(403).json({ error: 'Requête refusée', code: 'ADMIN_CSRF_BLOCKED' });
    }
  }
  res.clearCookie(ADMIN_COOKIE_NAME, getAdminCookieOptions());
  res.json({ success: true });
});

// POST /api/portfolio/auth/change-password - Changer le mot de passe admin
router.post('/auth/change-password',
  limitDataSize,
  sanitizeData,
  authenticateAdmin,
  requireTrustedAdminOrigin,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validation des champs
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: 'Le mot de passe actuel et le nouveau mot de passe sont requis' 
        });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          error: 'Le nouveau mot de passe doit contenir au minimum 8 caractères' 
        });
      }
      
      const adminResolved = await resoudreAdminParEmail(req.admin?.email);
      const currentHash = adminResolved?.admin?.passwordHash;
      if (!adminResolved || !currentHash) {
        logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Changement mot de passe impossible: admin introuvable', {
          email: req.admin?.email || null
        });
        return res.status(404).json({
          error: 'Compte administrateur introuvable',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      // Vérifier le mot de passe actuel
      const isValidPassword = await bcrypt.compare(currentPassword, currentHash);
      
      if (!isValidPassword) {
        logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Tentative de changement de mot de passe avec mot de passe actuel incorrect', {
          email: req.admin.email
        });
        return res.status(401).json({ 
          error: 'Mot de passe actuel incorrect' 
        });
      }
      
      // Générer le nouveau hash avec bcrypt
      // Utilisation de 12 rounds pour un bon équilibre sécurité/performance
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      if (adminResolved.source === 'db' && adminResolved.admin.save) {
        adminResolved.admin.passwordHash = newPasswordHash;
        adminResolved.admin.updatedAt = new Date();
        await adminResolved.admin.save();

        logSecurity('<svg class=emoji-icon aria-hidden=true></svg> Mot de passe admin changé (persisté en base)', { email: req.admin.email });
        return res.json({
          success: true,
          message: 'Mot de passe changé avec succès.',
          code: 'PASSWORD_CHANGED'
        });
      }

      // Fallback env: actif immédiatement en runtime, mais non persistant après redémarrage.
      process.env.ADMIN_PASSWORD_HASH = newPasswordHash;
      logWarn('<svg class=emoji-icon aria-hidden=true></svg> Mot de passe changé en mémoire runtime (source env). Mise à jour des secrets requise pour persister.');
      return res.json({
        success: true,
        message: 'Mot de passe changé pour cette session serveur. Pour le rendre permanent, mettez à jour ADMIN_PASSWORD_HASH puis redémarrez.',
        instructions: [
          'Mettez à jour ADMIN_PASSWORD_HASH dans vos secrets de déploiement',
          'Redémarrez le backend'
        ],
        code: 'PASSWORD_CHANGED_RUNTIME_ONLY'
      });
      
    } catch (error) {
      // Log détaillé de l'erreur pour diagnostic
      // Les erreurs sont toujours loggées même en production
      logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur lors du changement de mot de passe:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        path: req.path,
        method: req.method,
        origin: req.headers.origin,
        adminEmail: req.admin?.email,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({ 
        error: 'Erreur serveur lors du changement de mot de passe',
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  }
);

// Demande d'accès : enregistre la demande et notifie l'admin, sans envoyer le document
router.post(
  '/projects/:title/request-doc',
  strictLimiter,
  limitDataSize,
  sanitizeData,
  validateRequestDoc,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { title } = req.params;
    const { firstName, lastName, email, message, subject } = req.body;

    const portfolio = await Portfolio.findOne();
    if (!portfolio || !Array.isArray(portfolio.projects)) {
// Demande d'accès au rapport de stage (code requis)
router.post(
  '/stages/:title/request-report',
  strictLimiter,
  limitDataSize,
  sanitizeData,
  validateRequestDoc,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title } = req.params;
      const { firstName, lastName, email, message, subject } = req.body;

      const portfolio = await Portfolio.findOne();
      if (!portfolio || !Array.isArray(portfolio.stages)) {
        return res.status(404).json({ error: 'Aucun stage', code: 'NO_STAGE' });
      }

      const stage = portfolio.stages.find(s => titleEquals(s.title, decodeURIComponent(title)));
      if (!stage || !stage.docFile || !stage.docPasswordHash) {
        return res.status(404).json({ error: 'Rapport introuvable pour ce stage', code: 'STAGE_REPORT_NOT_FOUND' });
      }

      const demande = {
        id: Date.now(),
        name: `${firstName || ''} ${lastName || ''}`.trim() || 'Demandeur',
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || `Demande code rapport - ${stage.title}`,
        message: message?.trim() || 'Demande de code pour rapport de stage',
        date: new Date().toISOString(),
        read: false
      };
      await appendContactMessage(demande);

      const transporter = getMailTransporter();
      if (transporter && process.env.ADMIN_EMAIL) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL,
          replyTo: email,
          subject: subject?.trim() || `Demande code rapport - ${stage.title}`,
          text: `Demande de code pour le rapport de stage "${stage.title}"
Nom: ${firstName || ''} ${lastName || ''}
Email: ${email}
Message: ${message || ''}`
        }).catch(err => logWarn('<svg class=emoji-icon aria-hidden=true></svg> Notification admin non envoyée (rapport stage)', err));
      }

      res.json({ success: true, message: 'Demande envoyée. Vous recevrez un code si votre demande est acceptée.' });
    } catch (error) {
      logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur demande rapport stage:', error);
      res.status(500).json({ error: 'Erreur serveur', code: 'STAGE_REPORT_REQUEST_ERROR' });
    }
  }
);

// Validation du code de rapport de stage pour obtenir un lien temporaire
router.post(
  '/stages/:title/validate-report',
  strictLimiter,
  limitDataSize,
  sanitizeData,
  validateDocPassword,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title } = req.params;
      const { password } = req.body;

      const portfolio = await Portfolio.findOne();
      if (!portfolio || !Array.isArray(portfolio.stages)) {
        return res.status(404).json({ error: 'Aucun stage', code: 'NO_STAGE' });
      }

      const stage = portfolio.stages.find(s => titleEquals(s.title, decodeURIComponent(title)));
      if (!stage || !stage.docFile || !stage.docPasswordHash) {
        return res.status(404).json({ error: 'Rapport introuvable pour ce stage', code: 'STAGE_REPORT_NOT_FOUND' });
      }

      const ok = await bcrypt.compare(password, stage.docPasswordHash);
      if (!ok) {
        return res.status(401).json({ error: 'Code incorrect', code: 'INVALID_STAGE_CODE' });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Configuration JWT manquante', code: 'MISSING_JWT' });
      }

      const token = jwt.sign(
        { stageTitle: stage.title, purpose: 'stage-report-download' },
        process.env.JWT_SECRET,
        { expiresIn: '1h', audience: TEMP_DOWNLOAD_AUDIENCE, issuer: TEMP_DOWNLOAD_ISSUER }
      );
      const base = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
      const downloadLink = `${base}/api/portfolio/stages/${encodeURIComponent(stage.title)}/download-report?token=${token}`;
      res.json({ success: true, downloadLink });
    } catch (error) {
      logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur validation code rapport stage:', error);
      res.status(500).json({ error: 'Erreur serveur', code: 'STAGE_REPORT_CODE_ERROR' });
    }
  }
);

// Téléchargement du rapport de stage via token
router.get('/stages/:title/download-report', async (req, res) => {
  try {
    const { title } = req.params;
    const { token } = req.query;
    if (!token) return res.status(401).json({ error: 'Token manquant' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Configuration JWT manquante' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, {
        audience: TEMP_DOWNLOAD_AUDIENCE,
        issuer: TEMP_DOWNLOAD_ISSUER
      });
    } catch (e) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio || !Array.isArray(portfolio.stages)) {
      return res.status(404).json({ error: 'Aucun stage', code: 'NO_STAGE' });
    }
    const stage = portfolio.stages.find(s => titleEquals(s.title, decodeURIComponent(title)));
    if (!stage || !stage.docFile) {
      return res.status(404).json({ error: 'Rapport introuvable', code: 'STAGE_REPORT_NOT_FOUND' });
    }

    if (payload.stageTitle !== stage.title) {
      return res.status(403).json({ error: 'Token non valide pour ce stage', code: 'TOKEN_STAGE_MISMATCH' });
    }

    const dataUrl = stage.docFile;
    const mime = safeMimeFromDataUrl(dataUrl, ALLOWED_DOC_MIMES);
    if (!mime) {
      return res.status(400).json({ error: 'Type de document non autorise', code: 'STAGE_REPORT_INVALID_MIME' });
    }
    const base64 = dataUrl.split(',').pop();
    const buffer = Buffer.from(base64, 'base64');
    const fileEsc = escapeFilenameForHeader(stage.docFileName, 'rapport-stage.pdf');

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${fileEsc.ascii}"; filename*=UTF-8''${fileEsc.utf8}`);
    res.send(buffer);
  } catch (error) {
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur téléchargement rapport stage:', error);
    res.status(500).json({ error: 'Erreur serveur', code: 'STAGE_REPORT_DOWNLOAD_ERROR' });
  }
});

// Demande d'accès au rapport d'alternance (code requis)
router.post(
  '/alternances/:title/request-report',
  strictLimiter,
  limitDataSize,
  sanitizeData,
  validateRequestDoc,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title } = req.params;
      const { firstName, lastName, email, message, subject } = req.body;

      const portfolio = await Portfolio.findOne();
      if (!portfolio || !Array.isArray(portfolio.alternances)) {
        return res.status(404).json({ error: 'Aucune alternance', code: 'NO_ALTERNANCE' });
      }

      const alternance = portfolio.alternances.find(a => titleEquals(a.title, decodeURIComponent(title)));
      if (!alternance || !alternance.docFile || !alternance.docPasswordHash) {
        return res.status(404).json({ error: 'Rapport introuvable pour cette alternance', code: 'ALTERNANCE_REPORT_NOT_FOUND' });
      }

      const demande = {
        id: Date.now(),
        name: `${firstName || ''} ${lastName || ''}`.trim() || 'Demandeur',
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || `Demande code rapport - ${alternance.title}`,
        message: message?.trim() || 'Demande de code pour rapport d\'alternance',
        date: new Date().toISOString(),
        read: false
      };
      await appendContactMessage(demande);

      const transporter = getMailTransporter();
      if (transporter && process.env.ADMIN_EMAIL) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL,
          replyTo: email,
          subject: subject?.trim() || `Demande code rapport - ${alternance.title}`,
          text: `Demande de code pour le rapport d'alternance "${alternance.title}"
Nom: ${firstName || ''} ${lastName || ''}
Email: ${email}
Message: ${message || ''}`
        }).catch(err => logWarn('<svg class=emoji-icon aria-hidden=true></svg> Notification admin non envoyée (rapport alternance)', err));
      }

      res.json({ success: true, message: 'Demande envoyée. Vous recevrez un code si votre demande est acceptée.' });
    } catch (error) {
      logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur demande rapport alternance:', error);
      res.status(500).json({ error: 'Erreur serveur', code: 'ALTERNANCE_REPORT_REQUEST_ERROR' });
    }
  }
);

// Validation du code de rapport d'alternance pour obtenir un lien temporaire
router.post(
  '/alternances/:title/validate-report',
  strictLimiter,
  limitDataSize,
  sanitizeData,
  validateDocPassword,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title } = req.params;
      const { password } = req.body;

      const portfolio = await Portfolio.findOne();
      if (!portfolio || !Array.isArray(portfolio.alternances)) {
        return res.status(404).json({ error: 'Aucune alternance', code: 'NO_ALTERNANCE' });
      }

      const alternance = portfolio.alternances.find(a => titleEquals(a.title, decodeURIComponent(title)));
      if (!alternance || !alternance.docFile || !alternance.docPasswordHash) {
        return res.status(404).json({ error: 'Rapport introuvable pour cette alternance', code: 'ALTERNANCE_REPORT_NOT_FOUND' });
      }

      const ok = await bcrypt.compare(password, alternance.docPasswordHash);
      if (!ok) {
        return res.status(401).json({ error: 'Code incorrect', code: 'INVALID_ALTERNANCE_CODE' });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Configuration JWT manquante', code: 'MISSING_JWT' });
      }

      const token = jwt.sign(
        { alternanceTitle: alternance.title, purpose: 'alternance-report-download' },
        process.env.JWT_SECRET,
        { expiresIn: '1h', audience: TEMP_DOWNLOAD_AUDIENCE, issuer: TEMP_DOWNLOAD_ISSUER }
      );
      const base = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
      const downloadLink = `${base}/api/portfolio/alternances/${encodeURIComponent(alternance.title)}/download-report?token=${token}`;
      res.json({ success: true, downloadLink });
    } catch (error) {
      logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur validation code rapport alternance:', error);
      res.status(500).json({ error: 'Erreur serveur', code: 'ALTERNANCE_REPORT_CODE_ERROR' });
    }
  }
);

// Téléchargement du rapport d'alternance via token
router.get('/alternances/:title/download-report', async (req, res) => {
  try {
    const { title } = req.params;
    const { token } = req.query;
    if (!token) return res.status(401).json({ error: 'Token manquant' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Configuration JWT manquante' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, {
        audience: TEMP_DOWNLOAD_AUDIENCE,
        issuer: TEMP_DOWNLOAD_ISSUER
      });
    } catch (e) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    // Vérifier que le token correspond à la bonne alternance
    if (!titleEquals(decodeURIComponent(title), payload.alternanceTitle)) {
      return res.status(401).json({ error: 'Token invalide pour cette alternance' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio || !Array.isArray(portfolio.alternances)) {
      return res.status(404).json({ error: 'Aucune alternance', code: 'NO_ALTERNANCE' });
    }

    const alternance = portfolio.alternances.find(a => titleEquals(a.title, decodeURIComponent(title)));
    if (!alternance || !alternance.docFile) {
      return res.status(404).json({ error: 'Rapport introuvable', code: 'ALTERNANCE_REPORT_NOT_FOUND' });
    }

    const mime = safeMimeFromDataUrl(alternance.docFile, ALLOWED_DOC_MIMES);
    if (!mime) {
      return res.status(400).json({ error: 'Type de document non autorise', code: 'ALTERNANCE_REPORT_INVALID_MIME' });
    }

    const docBuffer = Buffer.from(alternance.docFile.split(',')[1], 'base64');
    const alternanceFileEsc = escapeFilenameForHeader(alternance.docFileName, 'rapport-alternance.pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${alternanceFileEsc.ascii}"; filename*=UTF-8''${alternanceFileEsc.utf8}`);
    res.setHeader('Content-Type', mime);
    res.send(docBuffer);
  } catch (error) {
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur download rapport alternance:', error);
    res.status(500).json({ error: 'Erreur serveur', code: 'ALTERNANCE_REPORT_DOWNLOAD_ERROR' });
  }
});

      return res.status(404).json({ error: 'Aucun projet', code: 'NO_PROJECT' });
    }

    const projet = portfolio.projects.find(p => titleEquals(p.title, decodeURIComponent(title)));
    if (!projet || !projet.docFile || !projet.docPasswordHash) {
      return res.status(404).json({ error: 'Document introuvable pour ce projet', code: 'DOC_NOT_FOUND' });
    }

    // Enregistrer la demande dans contactMessages pour suivi admin
    const demande = {
      id: Date.now(),
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'Demandeur',
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || `Demande mot de passe - ${projet.title}`,
      message: message?.trim() || 'Demande de mot de passe pour document protégé',
      date: new Date().toISOString(),
      read: false
    };
    await appendContactMessage(demande);

    // Notifier l'admin par email si SMTP configuré
    const transporter = getMailTransporter();
    if (transporter && process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        replyTo: email, // permet de répondre directement au demandeur
        subject: subject || `Demande mot de passe - ${projet.title}`,
        text: `Nouvelle demande pour le document du projet "${projet.title}"\n\nNom: ${firstName || ''} ${lastName || ''}\nEmail: ${email}\nObjet: ${subject || 'Voir/Télécharger le document'}\nMessage: ${message || ''}`
      }).catch(err => logWarn('<svg class=emoji-icon aria-hidden=true></svg> Notification admin non envoyée', err));
    }

    res.json({ success: true, message: 'Demande envoyée. Vous recevrez un mot de passe si votre demande est acceptée.' });
  } catch (error) {
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur demande doc projet:', error);
    res.status(500).json({ error: 'Erreur serveur', code: 'DOC_REQUEST_ERROR' });
  }
});

// Validation du mot de passe pour obtenir un lien de téléchargement temporaire
router.post(
  '/projects/:title/validate-password',
  strictLimiter,
  limitDataSize,
  sanitizeData,
  validateDocPassword,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { title } = req.params;
    const { password } = req.body;

    const portfolio = await Portfolio.findOne();
    if (!portfolio || !Array.isArray(portfolio.projects)) {
      return res.status(404).json({ error: 'Aucun projet', code: 'NO_PROJECT' });
    }

    const projet = portfolio.projects.find(p => titleEquals(p.title, decodeURIComponent(title)));
    if (!projet || !projet.docFile || !projet.docPasswordHash) {
      return res.status(404).json({ error: 'Document introuvable pour ce projet', code: 'DOC_NOT_FOUND' });
    }

    const ok = await bcrypt.compare(password, projet.docPasswordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Mot de passe incorrect', code: 'INVALID_PASSWORD' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Configuration JWT manquante', code: 'MISSING_JWT' });
    }

    const token = jwt.sign(
      { projectTitle: projet.title, purpose: 'project-document-download' },
      process.env.JWT_SECRET,
      { expiresIn: '1h', audience: TEMP_DOWNLOAD_AUDIENCE, issuer: TEMP_DOWNLOAD_ISSUER }
    );
    const downloadLink = construireLienTelechargement(req, projet.title, token);
    res.json({ success: true, downloadLink });
  } catch (error) {
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur validation mot de passe doc:', error);
    res.status(500).json({ error: 'Erreur serveur', code: 'DOC_PASSWORD_ERROR' });
  }
});

// Téléchargement du document protégé via token temporaire
router.get('/projects/:title/download', async (req, res) => {
  try {
    const { title } = req.params;
    const { token } = req.query;
    if (!token) return res.status(401).json({ error: 'Token manquant' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Configuration JWT manquante' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, {
        audience: TEMP_DOWNLOAD_AUDIENCE,
        issuer: TEMP_DOWNLOAD_ISSUER
      });
    } catch (e) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio || !Array.isArray(portfolio.projects)) {
      return res.status(404).json({ error: 'Aucun projet', code: 'NO_PROJECT' });
    }
    const projet = portfolio.projects.find(p => titleEquals(p.title, decodeURIComponent(title)));
    if (!projet || !projet.docFile) {
      return res.status(404).json({ error: 'Document introuvable', code: 'DOC_NOT_FOUND' });
    }

    if (payload.projectTitle !== projet.title) {
      return res.status(403).json({ error: 'Token non valide pour ce projet', code: 'TOKEN_PROJECT_MISMATCH' });
    }

    const dataUrl = projet.docFile;
    const mime = safeMimeFromDataUrl(dataUrl, ALLOWED_DOC_MIMES);
    if (!mime) {
      return res.status(400).json({ error: 'Type de document non autorise', code: 'PROJECT_DOC_INVALID_MIME' });
    }
    const base64 = dataUrl.split(',').pop();
    const buffer = Buffer.from(base64, 'base64');
    const fileEsc = escapeFilenameForHeader(projet.docFileName, 'document.pdf');

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${fileEsc.ascii}"; filename*=UTF-8''${fileEsc.utf8}`);
    res.send(buffer);
  } catch (error) {
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur téléchargement doc projet:', error);
    res.status(500).json({ error: 'Erreur serveur', code: 'DOC_DOWNLOAD_ERROR' });
  }
});

// POST /api/portfolio/contact - Envoyer un message de contact
router.post(
  '/contact',
  strictLimiter,
  limitDataSize,
  sanitizeData,
  validateContactMessage,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Récupérer le portfolio et ajouter le message
    const portfolio = await Portfolio.findOne();
    
    if (!portfolio) {
      // Créer un nouveau portfolio si inexistant
      const defaultData = require('../models/Portfolio').MINIMAL_PORTFOLIO_DATA || {};
      await Portfolio.create(defaultData);
    }
    
    // Générer un ID unique pour le message
    const existingMessages = portfolio?.contactMessages || [];
    const newMessageId = existingMessages.length > 0 
      ? Math.max(...existingMessages.map(m => m.id || 0)) + 1 
      : 1;
    
    // Créer le nouveau message
    const newMessage = {
      id: newMessageId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : 'Sans objet',
      message: message.trim(),
      date: new Date().toISOString(),
      read: false
    };
    
    // Ajouter le message au portfolio
    const portfolioUpdate = await Portfolio.findOneAndUpdate(
      {},
      {
        $push: {
          contactMessages: {
            $each: [newMessage],
            $slice: -Math.max(1, MAX_CONTACT_MESSAGES)
          }
        }
      },
      { new: true, upsert: true }
    );
    
    // Vérification que le message a bien été ajouté
    if (!portfolioUpdate) {
      throw new Error('Impossible de sauvegarder le message dans la base de données');
    }
    
    // Vérifier que le message est bien présent
    const portfolioVerifie = await Portfolio.findOne();
    const messageVerifie = portfolioVerifie?.contactMessages?.find(m => m.id === newMessageId);
    
    if (!messageVerifie) {
      throw new Error('Le message n\'a pas été correctement sauvegardé');
    }
    
    logSuccess('<svg class=emoji-icon aria-hidden=true></svg> Message de contact reçu et sauvegardé:', {
      id: newMessageId,
      email: email,
      subject: subject || 'Sans objet',
      totalMessages: portfolioVerifie.contactMessages?.length || 0
    });

    // Envoyer un email de notification à l'admin si SMTP est configuré
    const transporter = getMailTransporter();
    if (transporter && process.env.ADMIN_EMAIL) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL,
          replyTo: email,
          subject: subject || 'Nouveau message de contact',
          text: `Nouveau message de contact\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject || 'Sans objet'}\n\nMessage:\n${message}`
        });
      } catch (err) {
        logWarn('<svg class=emoji-icon aria-hidden=true></svg> Notification email contact non envoyée', err);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Message envoyé et sauvegardé avec succès',
      messageId: newMessageId,
      saved: true
    });
    
  } catch (error) {
    // Log détaillé de l'erreur pour diagnostic
    // Les erreurs sont toujours loggées même en production
    logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur lors de l\'envoi du message:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    
    // Gestion d'erreurs spécifiques
    if (error.name === 'MongoServerError' || error.message.includes('MongoDB') || error.message.includes('connection')) {
      logError('<svg class=emoji-icon aria-hidden=true></svg> Erreur MongoDB détectée');
      return res.status(503).json({ 
        error: 'Service temporairement indisponible',
        message: 'La base de données est temporairement indisponible. Veuillez réessayer dans quelques instants.',
        code: 'DATABASE_ERROR'
      });
    }
    
    // Erreur de validation MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides',
        message: 'Les données du message ne sont pas valides',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Erreur générique
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'envoi du message',
      message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
