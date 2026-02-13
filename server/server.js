/**
 * Serveur Backend - Portfolio de Nema Elisée Kourouma
 * 
 * Ce serveur Node.js/Express gère :
 * - L'API REST pour le portfolio
 * - L'authentification admin sécurisée
 * - La connexion à MongoDB Atlas
 * - La protection contre les attaques courantes
 * 
 * @author Nema Elisée Kourouma
 * @date 2026
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Importer le système de logging centralisé
const { log, logError, logWarn, logRequest, logSecurity, estEnDeveloppement } = require('./utils/logger');

// Vérification des variables d'environnement critiques (uniquement en développement)
// Cette vérification aide à détecter les problèmes de configuration tôt
// En production, on ne logge pas ces informations pour des raisons de sécurité
if (estEnDeveloppement) {
  const envKeys = Object.keys(process.env).filter(key => 
    key.includes('ADMIN') || key.includes('MONGODB') || key.includes('JWT') || key.includes('NODE')
  );
  log('🔍 Variables d\'environnement critiques détectées:');
  envKeys.forEach(key => {
    const value = process.env[key];
    if (key.includes('PASSWORD') || key.includes('SECRET') || key.includes('URI')) {
      log(`  ${key}: ${value ? '✅ Présent (' + value.substring(0, 10) + '...)' : '❌ Absent'}`);
    } else {
      log(`  ${key}: ${value || '❌ Absent'}`);
    }
  });
}

const app = express();

// ETag fort pour de meilleures revalidations côté client/CDN
app.set('etag', 'strong');

// Activer trust proxy pour Fly.io (nécessaire pour rate limiting et IP correcte)
// Utiliser 1 au lieu de true pour éviter l'avertissement express-rate-limit
// Fly.io utilise un seul proxy, donc 1 est suffisant
app.set('trust proxy', 1);

// Forcer HTTPS en production (derrière proxy Fly.io)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
    }
  }
  next();
});

// Middleware pour stocker le chemin de la requête (pour CORS - doit être avant /health)
app.use((req, res, next) => {
  global.currentPath = req.path;
  next();
});

// Route de health check (doit être tôt pour que Fly.io puisse vérifier)
// Cette route doit être accessible SANS passer par CORS ou autres middlewares complexes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configuration de sécurité avec Helmet
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Pour permettre les images externes
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:"],
    }
  }
}));

// En-têtes de durcissement supplémentaires
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Rate limiting (augmenté pour le développement)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 300, // Limite réduite en production
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Ignorer complètement le rate limiting en développement
    return process.env.NODE_ENV === 'development';
  },
  handler: (req, res) => {
    // Logger les tentatives de rate limiting (toujours actif pour la sécurité)
    logSecurity(`🚫 Rate limit atteint pour IP: ${req.ip}`, {
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      error: 'Trop de requêtes',
      message: 'Veuillez réessayer dans 15 minutes'
    });
  }
});

// Rate limiting spécial pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // 100 en dev, 5 en prod
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Ne pas compter les connexions réussies
  skip: (req) => {
    // Ignorer le rate limiting en développement
    return process.env.NODE_ENV === 'development';
  },
  handler: (req, res) => {
    // Logger les tentatives de rate limiting sur l'authentification (toujours actif pour la sécurité)
    logSecurity(`🚫 Trop de tentatives de connexion pour IP: ${req.ip}`, {
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      error: 'Trop de tentatives de connexion',
      message: 'Veuillez réessayer dans 15 minutes'
    });
  }
});

// Appliquer le rate limiting général
app.use(limiter);

// Rate limiting pour les routes d'auth (plus strict)
app.use('/api/portfolio/login', authLimiter);

// Configuration CORS sécurisée
const corsOptions = {
  origin: function (origin, callback) {
    // Récupérer le chemin depuis la requête (via req.path dans le middleware)
    const currentPath = global.currentPath || '';
    
    // Autoriser les health checks sans origin (pour Fly.io et monitoring)
    if (currentPath === '/health') {
      return callback(null, true);
    }
    
    // En développement, autoriser localhost
    if (process.env.NODE_ENV === 'development') {
      const allowedLocalOrigins = [
        'http://localhost:8000',
        'http://localhost:3000',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:3000'
      ];
      
      // En développement, autoriser toutes les origines localhost
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || allowedLocalOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // En production, liste stricte des origines autorisées
    // Les origines sont définies via la variable d'environnement ALLOWED_ORIGINS
    // Format: ALLOWED_ORIGINS=https://domain1.com,https://domain2.com
    const allowedOrigins = [];
    
    // Ajouter les origines depuis les variables d'environnement (obligatoire en production)
    if (process.env.ALLOWED_ORIGINS) {
      const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
      allowedOrigins.push(...envOrigins);
    } else if (process.env.NODE_ENV === 'production') {
      // En production, ALLOWED_ORIGINS doit être défini
      logWarn('⚠️ ALLOWED_ORIGINS non défini en production - CORS peut être restrictif');
    }
    
    // Ajouter le domaine du portfolio par défaut si présent dans les variables d'environnement
    if (process.env.PORTFOLIO_DOMAIN) {
      allowedOrigins.push(process.env.PORTFOLIO_DOMAIN);
    }
    
    // Vérification stricte des origines
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(null, false);
      } else {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Logger uniquement si c'est une vraie tentative d'accès (avec origin)
      logSecurity('🚫 CORS: Origine non autorisée:', { origin: origin, path: currentPath });
      callback(null, false); // false = bloquer sans erreur
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token',
    'X-Requested-With'
  ],
  exposedHeaders: ['x-auth-token'],
  maxAge: 86400, // Cache preflight pour 24h
  optionsSuccessStatus: 200 // Pour IE11
};

// Middleware de logging pour les requêtes HTTP (uniquement en développement)
// Ne logger que les requêtes API (pas les health checks) pour éviter le spam
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    logRequest(req.method, req.path, req.headers.origin);
  }
  next();
});

// Appliquer CORS avec le chemin stocké et gestion d'erreurs
app.use((req, res, next) => {
  global.currentPath = req.path;
  
  // Wrapper CORS pour capturer les erreurs avant qu'elles n'atteignent le middleware global
  cors(corsOptions)(req, res, (err) => {
    // Si erreur CORS, répondre directement sans passer au middleware suivant
    if (err) {
      // Ne pas logger comme erreur serveur - c'est normal pour les requêtes bloquées
      return res.status(403).json({ 
        error: 'Accès refusé',
        message: 'Origine non autorisée',
        code: 'CORS_ERROR'
      });
    }
    next();
  });
});

app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les gros objets
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Gérer explicitement les requêtes OPTIONS (preflight) - exclure /health
app.options('*', (req, res, next) => {
  if (req.path === '/health') {
    return res.status(200).end();
  }
  // Wrapper CORS pour capturer les erreurs
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      // Erreur CORS - répondre silencieusement
      return res.status(403).json({ 
        error: 'Accès refusé',
        code: 'CORS_ERROR'
      });
    }
    next();
  });
});

// Routes
const portfolioRoutes = require('./routes/portfolio');
app.use('/api/portfolio', portfolioRoutes);

// Validation des variables d'environnement obligatoires
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'ALLOWED_ORIGINS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logError('❌ Variables d\'environnement manquantes:', { missing: missingVars.join(', ') });
  logError('💡 Vérifiez vos secrets Fly.io avec: flyctl secrets list -a portfolio-backend-elisee');
  if (process.env.NODE_ENV === 'production') {
    logError('⛔ Arrêt du serveur: variables critiques manquantes en production');
    process.exit(1);
  }
}

// Démarrer le serveur APRÈS tous les middlewares
// Écouter sur 0.0.0.0 pour être accessible depuis Fly.io
const PORT = process.env.PORT || 3000;
log(`📡 Démarrage du serveur sur le port ${PORT}...`);
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logSuccess(`🚀 Serveur démarré avec succès sur le port ${PORT}`);
    log(`📡 API disponible sur http://0.0.0.0:${PORT}/api/portfolio`);
    log(`🌐 Health check disponible sur http://0.0.0.0:${PORT}/health`);
  });
} catch (error) {
  logError('❌ Erreur lors du démarrage du serveur:', { message: error.message, stack: error.stack });
  process.exit(1);
}

// Connexion à MongoDB (en arrière-plan, ne bloque pas le démarrage du serveur)
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  logSuccess('✅ Connecté à MongoDB');
  
  // Initialiser les données par défaut uniquement si la collection est vide
  try {
    const Portfolio = require('./models/Portfolio');
    const existingPortfolio = await Portfolio.findOne();
    
    if (!existingPortfolio) {
      log('📋 Collection vide, création des données par défaut...');
      const defaultData = {
        personal: {
          fullName: "Nema Elisée Kourouma",
          email: process.env.ADMIN_EMAIL,
          phone: "",
          photo: "assets/photo.jpeg",
          currentEducation: "Master en Intelligence Artificielle",
          previousEducation: "Licence en mathématiques et informatique (USMBA Fès)",
          additionalInfo: []
        },
        projects: [],
        skills: [
          {
            category: 'Langages de programmation',
            icon: '💻',
            items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++']
          },
          {
            category: 'Développement Web',
            icon: '🌐',
            items: ['React', 'Node.js', 'Express', 'HTML5', 'CSS3']
          },
          {
            category: 'Bases de données',
            icon: '🗄️',
            items: ['MongoDB', 'MySQL', 'PostgreSQL']
          },
          {
            category: 'Intelligence Artificielle',
            icon: '🤖',
            items: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'Scikit-learn']
          },
          {
            category: 'Outils & Technologies',
            icon: '🛠️',
            items: ['Git', 'Docker', 'REST API', 'GraphQL', 'Linux']
          }
        ],
        links: { cv: "", cvFile: "", cvFileName: "", cvFileSize: 0, social: [] },
        about: { 
          heroDescription: "Master en Intelligence Artificielle",
          stats: { projects: 0, experience: 2, technologies: 10 }
        },
        timeline: [
          {
            date: '2025 - Présent',
            title: 'Master Intelligence Artificielle',
            subtitle: 'Formation en cours',
            description: 'Spécialisation en Intelligence Artificielle, Machine Learning et Deep Learning. Développement de projets avancés en IA et applications intelligentes.'
          },
          {
            date: '2021 - 2025',
            title: 'Licence en Mathématiques et Informatique',
            subtitle: 'USMBA Fès',
            description: 'Formation fondamentale en mathématiques appliquées et informatique. Acquisition de solides bases théoriques et pratiques en algorithmique, structures de données et programmation.'
          }
        ],
        services: [],
        certifications: [],
        contactMessages: [],
        faq: []
      };
      
      await Portfolio.create(defaultData);
      logSuccess('✅ Données par défaut créées');
    } else {
      log('📋 Données existantes trouvées, aucune initialisation nécessaire');
    }
  } catch (initError) {
    logError('⚠️ Erreur lors de l\'initialisation:', { message: initError.message });
  }
})
.catch((error) => {
  logError('❌ Erreur de connexion à MongoDB:', {
    message: error.message,
    name: error.name,
    code: error.code,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  logWarn('💡 Assurez-vous que MongoDB est démarré ou utilisez MongoDB Atlas');
  logWarn('💡 Vérifiez la variable MONGODB_URI dans les secrets Fly.io');
  logWarn('⚠️ Le serveur fonctionne, mais MongoDB n\'est pas disponible - les routes retourneront des données par défaut');
});

// Gestion globale des erreurs (middleware de fin)
app.use((err, req, res, next) => {
  // Ignorer complètement les erreurs CORS (déjà gérées par le middleware CORS)
  // Vérifier plusieurs patterns pour détecter les erreurs CORS
  const isCorsError = err.message && (
    err.message.includes('CORS') || 
    err.message.includes('cors') || 
    err.message.includes('Origine') ||
    err.message.includes('Origin') ||
    err.message.includes('non autorisée') ||
    err.message.includes('not allowed')
  );
  
  if (isCorsError) {
    // Erreur CORS - répondre silencieusement sans logger
    // (déjà gérée par le middleware CORS, mais au cas où)
    return res.status(403).json({ 
      error: 'Accès refusé',
      message: 'Origine non autorisée',
      code: 'CORS_ERROR'
    });
  }
  
  // Log détaillé uniquement pour les vraies erreurs serveur
  logError('❌ Erreur serveur non gérée:', {
    message: err.message,
    name: err.name,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method,
    origin: req.headers.origin || 'none',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
  
  // En développement, envoyer plus de détails
  if (process.env.NODE_ENV === 'development') {
    res.status(err.status || 500).json({ 
      error: 'Erreur serveur interne',
      message: err.message,
      stack: err.stack,
      code: 'SERVER_ERROR'
    });
  } else {
    // En production, message générique pour la sécurité
    res.status(err.status || 500).json({ 
      error: 'Erreur serveur interne',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = app;
